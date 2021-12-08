// TODO: move to own package
import * as acorn from 'acorn'

import { VARIABLE_TYPE } from '../types'

interface AcornNode extends acorn.Node {
  body?: AcornNode[]
  expression?: AcornNode
  // Identifier
  name?: string
  // CallExpression
  callee?: AcornNode
  object?: AcornNode
  property?: AcornNode
  // ConditionalExpression
  test?: AcornNode
  argument?: {
    type: NODE_TYPES.IDENTIFIER
    name: string
  }
  left?: AcornNode
  right?: AcornNode
  operator?: string
  consequent?: AcornNode
  alternate?: AcornNode
  value?: boolean | string | number
  raw?: string
}

enum NODE_TYPES {
  EXPRESSION_ERROR = 'ExpressionError',
  EXPRESSION_STATEMENT = 'ExpressionStatement',
  IDENTIFIER = 'Identifier',
  LITERAL = 'Literal',
  CALL_EXPRESSION = 'CallExpression',
  CONDITIONAL_EXPRESSION = 'ConditionalExpression',
  BINARY_EXPRESSION = 'BinaryExpression',
  MEMBER_EXPRESSION = 'MemberExpression',
  UNARY_EXPRESSION = 'UnaryExpression'
}

interface GameVariables {
  [variableName: string]: {
    value: string | undefined
    type: VARIABLE_TYPE
  }
}

interface GameMethods {
  [methodName: string]: any
}

interface ExpressionBase {}

interface IdentifierExpression extends ExpressionBase {
  type: NODE_TYPES.IDENTIFIER
  variableName: string
}

interface CallExpression extends ExpressionBase {
  type: NODE_TYPES.CALL_EXPRESSION
  variableName: string
  methodName: string
}

interface ConditionalExpression extends ExpressionBase {
  type: NODE_TYPES.CONDITIONAL_EXPRESSION
  identifier?: {
    type: NODE_TYPES.IDENTIFIER
    variableName: string
  }
  argument?: {
    type: NODE_TYPES.IDENTIFIER
    name: string
  }
  left?: {
    type: NODE_TYPES.IDENTIFIER | NODE_TYPES.LITERAL
    variableName?: string // Identifier
    value?: boolean | string | number // Literal
  }
  right?: {
    type: NODE_TYPES.IDENTIFIER | NODE_TYPES.LITERAL
    variableName?: string
    value?: boolean | string | number
  }
  operator?: string
  consequent: {
    type: NODE_TYPES.IDENTIFIER | NODE_TYPES.LITERAL
    variableName?: string
    value?: boolean | string | number
  }
  alternate: {
    type: NODE_TYPES.IDENTIFIER | NODE_TYPES.LITERAL
    variableName?: string
    value?: boolean | string | number
  }
}

interface ExpressionError extends ExpressionBase {
  type: NODE_TYPES.EXPRESSION_ERROR
  message: string
}

export function getTemplateExpressionRanges(
  template: string
): { start: number; end: number }[] {
  const templateExpressionsWithIndex = [...template.matchAll(/{([^}]+)}/g)]

  return templateExpressionsWithIndex.map((expression) => {
    return {
      start: expression.index || 0,
      end: (expression.index || 0) + expression[0].length
    }
  })
}

export function getTemplateExpressions(template: string): string[] {
  const templateExpressions: string[] | null = template.match(/{([^}]+)}/g)

  return templateExpressions
    ? templateExpressions.map(
        (templateExpression: string) => templateExpression.replace(/{|}/g, '') // remove curly braces
      )
    : []
}

function processIdentifierExpression(
  expression: AcornNode,
  variables: GameVariables
): IdentifierExpression | ExpressionError {
  if (expression.type === NODE_TYPES.IDENTIFIER && expression.name) {
    return variables[expression?.name]
      ? { type: NODE_TYPES.IDENTIFIER, variableName: expression.name }
      : {
          type: NODE_TYPES.EXPRESSION_ERROR,
          message: `Unable to process identifier expression. '${expression.name}' is an unknown variable.`
        }
  } else {
    return {
      type: NODE_TYPES.EXPRESSION_ERROR,
      message: 'Unable to process identifier expression.'
    }
  }
}

function processCallExpression(
  expression: AcornNode,
  gameVariables: GameVariables,
  gameMethods: GameMethods
): CallExpression | ExpressionError {
  const callee = expression.callee

  if (
    callee &&
    callee.type === NODE_TYPES.MEMBER_EXPRESSION &&
    callee.object &&
    callee.object.type === NODE_TYPES.IDENTIFIER &&
    callee.object.name &&
    callee.property &&
    callee.property.type === NODE_TYPES.IDENTIFIER &&
    callee.property.name
  ) {
    if (
      gameVariables[callee.object.name] &&
      gameMethods[callee.property.name]
    ) {
      return {
        type: NODE_TYPES.CALL_EXPRESSION,
        variableName: callee.object.name,
        methodName: callee.property.name
      }
    } else {
      return {
        type: NODE_TYPES.EXPRESSION_ERROR,
        message: `Unable to process call expression. ${
          !gameVariables[callee.object.name]
            ? `Missing game variable: '${callee.object.name}' `
            : ''
        }${
          !gameMethods[callee.property.name]
            ? `Missing game method: '${callee.property.name}`
            : ''
        }`
      }
    }
  } else {
    return {
      type: NODE_TYPES.EXPRESSION_ERROR,
      message: `Unable to process call expression. Example format: '{ variableName.upper() }`
    }
  }
}

function processConditionalExpression(
  expression: AcornNode
): ConditionalExpression | ExpressionError {
  const test = expression.test,
    consequent = expression.consequent,
    alternate = expression.alternate

  if (
    test &&
    consequent &&
    (consequent.type === NODE_TYPES.IDENTIFIER ||
      consequent.type === NODE_TYPES.LITERAL) &&
    (consequent.name !== undefined || consequent.value !== undefined) &&
    alternate &&
    (alternate.type === NODE_TYPES.IDENTIFIER ||
      alternate.type === NODE_TYPES.LITERAL) &&
    (alternate.name !== undefined || alternate.value !== undefined)
  ) {
    if (
      test.type === NODE_TYPES.UNARY_EXPRESSION &&
      test.argument?.type === NODE_TYPES.IDENTIFIER &&
      test.argument?.name &&
      test.operator === '!'
    ) {
      return {
        type: NODE_TYPES.CONDITIONAL_EXPRESSION,
        argument: {
          name: test.argument.name,
          type: test.argument.type
        },
        consequent: {
          type: consequent.type,
          variableName:
            consequent.type === NODE_TYPES.IDENTIFIER
              ? consequent.name
              : undefined,
          value:
            consequent.type === NODE_TYPES.LITERAL
              ? consequent.value
              : undefined
        },
        alternate: {
          type: alternate.type,
          variableName:
            alternate.type === NODE_TYPES.IDENTIFIER
              ? alternate.name
              : undefined,
          value:
            alternate.type === NODE_TYPES.LITERAL ? alternate.value : undefined
        }
      }
    }

    if (test.type === NODE_TYPES.IDENTIFIER && test.name) {
      return {
        type: NODE_TYPES.CONDITIONAL_EXPRESSION,
        identifier: {
          type: NODE_TYPES.IDENTIFIER,
          variableName: test.name
        },
        consequent: {
          type: consequent.type,
          variableName:
            consequent.type === NODE_TYPES.IDENTIFIER
              ? consequent.name
              : undefined,
          value:
            consequent.type === NODE_TYPES.LITERAL
              ? consequent.value
              : undefined
        },
        alternate: {
          type: alternate.type,
          variableName:
            alternate.type === NODE_TYPES.IDENTIFIER
              ? alternate.name
              : undefined,
          value:
            alternate.type === NODE_TYPES.LITERAL ? alternate.value : undefined
        }
      }
    }

    if (
      test.type === NODE_TYPES.BINARY_EXPRESSION &&
      test.left &&
      (test.left.type === NODE_TYPES.IDENTIFIER ||
        test.left.type === NODE_TYPES.LITERAL) &&
      test.operator && // Check supported operator
      test.right &&
      (test.right.type === NODE_TYPES.IDENTIFIER ||
        test.right.type === NODE_TYPES.LITERAL)
    ) {
      return {
        type: NODE_TYPES.CONDITIONAL_EXPRESSION,
        left: {
          type: test.left.type,
          variableName:
            test.left.type === NODE_TYPES.IDENTIFIER
              ? test.left.name
              : undefined,
          value:
            test.left.type === NODE_TYPES.LITERAL ? test.left.value : undefined
        },
        right: {
          type: test.right.type,
          variableName:
            test.right.type === NODE_TYPES.IDENTIFIER
              ? test.right.name
              : undefined,
          value:
            test.right.type === NODE_TYPES.LITERAL
              ? test.right.value
              : undefined
        },
        operator: test.operator,
        consequent: {
          type: consequent.type,
          variableName:
            consequent.type === NODE_TYPES.IDENTIFIER
              ? consequent.name
              : undefined,
          value:
            consequent.type === NODE_TYPES.LITERAL
              ? consequent.value
              : undefined
        },
        alternate: {
          type: alternate.type,
          variableName:
            alternate.type === NODE_TYPES.IDENTIFIER
              ? alternate.name
              : undefined,
          value:
            alternate.type === NODE_TYPES.LITERAL ? alternate.value : undefined
        }
      }
    }

    return {
      type: NODE_TYPES.EXPRESSION_ERROR,
      message: `Unable to process conditional expression. Example format: '{ variableName > 0 ? "Greater than 0." : "Not greater than zero." }`
    }
  } else {
    return {
      type: NODE_TYPES.EXPRESSION_ERROR,
      message: `Unable to process conditional expression. Example format: '{ variableName > 0 ? "Greater than 0." : "Not greater than zero." }`
    }
  }
}

export function parseTemplateExpressions(
  templateExpressions: string[],
  variables: GameVariables,
  methods: GameMethods
): (
  | IdentifierExpression
  | CallExpression
  | ConditionalExpression
  | ExpressionError
)[] {
  const parsedExpressions: (
    | IdentifierExpression
    | CallExpression
    | ConditionalExpression
    | ExpressionError
  )[] = []

  templateExpressions.map((templateExpression) => {
    try {
      const parsedExpression: AcornNode = acorn.parse(templateExpression, {
          ecmaVersion: 2020
        }),
        statement = parsedExpression.body && parsedExpression.body[0],
        expression = statement?.expression

      if (
        statement &&
        statement.type === NODE_TYPES.EXPRESSION_STATEMENT &&
        expression
      ) {
        switch (expression.type) {
          case NODE_TYPES.IDENTIFIER:
            parsedExpressions.push(
              processIdentifierExpression(expression, variables)
            )
            break
          case NODE_TYPES.CALL_EXPRESSION:
            parsedExpressions.push(
              processCallExpression(expression, variables, methods)
            )
            break
          case NODE_TYPES.CONDITIONAL_EXPRESSION:
            parsedExpressions.push(processConditionalExpression(expression))
            break
          case NODE_TYPES.BINARY_EXPRESSION:
            parsedExpressions.push({
              type: NODE_TYPES.EXPRESSION_ERROR,
              message: `Unable to parse template expression. '${templateExpression}' is not supported, but is planned for a future release.`
            })
            break
          default:
            parsedExpressions.push({
              type: NODE_TYPES.EXPRESSION_ERROR,
              message: `Unable to parse template expression. '${templateExpression}' is not supported.`
            })
            break
        }
      } else {
        parsedExpressions.push({
          type: NODE_TYPES.EXPRESSION_ERROR,
          message: `Unable to parse template expression. '${templateExpression}' is not supported.`
        })
      }
    } catch (error) {
      parsedExpressions.push({
        type: NODE_TYPES.EXPRESSION_ERROR,
        message: `Unable to parse template expression. '${templateExpression}' is not supported.`
      })
    }
  })

  return parsedExpressions
}

export function getProcessedTemplate(
  template: string,
  expressions: string[],
  parsedExpressions: (
    | IdentifierExpression
    | CallExpression
    | ConditionalExpression
    | ExpressionError
  )[],
  variables: GameVariables,
  methods: GameMethods
) {
  let processedTemplate = `${template}`

  expressions.map((expression, index) => {
    const parsedExpression = parsedExpressions[index]

    let value

    switch (parsedExpression.type) {
      case NODE_TYPES.IDENTIFIER:
        value = variables[parsedExpression.variableName].value || 'undefined'
        break
      case NODE_TYPES.CALL_EXPRESSION:
        value = methods[parsedExpression.methodName]?.(
          variables[parsedExpression.variableName].value
        )
        break
      case NODE_TYPES.CONDITIONAL_EXPRESSION:
        const leftVariable = parsedExpression.left,
          rightVariable = parsedExpression.right

        const operator = parsedExpression.operator

        const consequent = parsedExpression.consequent,
          alternate = parsedExpression.alternate

        const consequentValue =
            consequent &&
            consequent.variableName &&
            consequent.type === NODE_TYPES.IDENTIFIER
              ? variables[consequent.variableName]
                ? variables[consequent.variableName].value || 'undefined'
                : 'esg-error'
              : consequent.value,
          alternateValue =
            alternate &&
            alternate.variableName &&
            alternate.type === NODE_TYPES.IDENTIFIER
              ? variables[alternate.variableName]
                ? variables[alternate.variableName].value || 'undefined'
                : 'esg-error'
              : alternate.value

        const foundLeftVariable = leftVariable?.variableName
            ? variables[leftVariable.variableName]
            : undefined,
          foundRightVariable = rightVariable?.variableName
            ? variables[rightVariable.variableName]
            : undefined

        switch (operator) {
          // NUMBERS
          case '>':
          case '>=':
          case '<':
          case '<=':
            // variables on both sides
            if (leftVariable?.variableName && rightVariable?.variableName) {
              if (
                foundLeftVariable &&
                foundLeftVariable.type === VARIABLE_TYPE.NUMBER &&
                foundLeftVariable.value &&
                foundRightVariable &&
                foundRightVariable.type === VARIABLE_TYPE.NUMBER &&
                foundRightVariable.value
              ) {
                switch (operator) {
                  case '>':
                    value =
                      Number(foundLeftVariable.value) >
                      Number(foundRightVariable.value)
                        ? consequentValue
                        : alternateValue
                    break
                  case '>=':
                    value =
                      Number(foundLeftVariable.value) >=
                      Number(foundRightVariable.value)
                        ? consequentValue
                        : alternateValue
                    break
                  case '<':
                    value =
                      Number(foundLeftVariable.value) <
                      Number(foundRightVariable.value)
                        ? consequentValue
                        : alternateValue
                    break
                  case '<=':
                    value =
                      Number(foundLeftVariable.value) <=
                      Number(foundRightVariable.value)
                        ? consequentValue
                        : alternateValue
                    break
                  default:
                    value = 'esg-error'
                }
              } else {
                value = 'esg-error'
              }
            }

            // variable on left or right
            if (
              (leftVariable?.variableName &&
                rightVariable &&
                !rightVariable.variableName) ||
              (rightVariable?.variableName &&
                leftVariable &&
                !leftVariable.variableName)
            ) {
              if (
                (foundLeftVariable &&
                  foundLeftVariable.type === VARIABLE_TYPE.NUMBER &&
                  foundLeftVariable.value &&
                  (rightVariable.value || rightVariable.value === 0) &&
                  typeof rightVariable.value === 'number') ||
                (foundRightVariable &&
                  foundRightVariable.type === VARIABLE_TYPE.NUMBER &&
                  foundRightVariable.value &&
                  (leftVariable.value || leftVariable.value === 0) &&
                  typeof leftVariable.value === 'number')
              ) {
                switch (operator) {
                  case '>':
                    value =
                      Number(foundLeftVariable?.value || leftVariable.value) >
                      Number(foundRightVariable?.value || rightVariable.value)
                        ? consequentValue
                        : alternateValue
                    break
                  case '>=':
                    value =
                      Number(foundLeftVariable?.value || leftVariable.value) >=
                      Number(foundRightVariable?.value || rightVariable.value)
                        ? consequentValue
                        : alternateValue
                    break
                  case '<':
                    value =
                      Number(foundLeftVariable?.value || leftVariable.value) <
                      Number(foundRightVariable?.value || rightVariable.value)
                        ? consequentValue
                        : alternateValue
                    break
                  case '<=':
                    value =
                      Number(foundLeftVariable?.value || leftVariable.value) <=
                      Number(foundRightVariable?.value || rightVariable.value)
                        ? consequentValue
                        : alternateValue
                    break
                  default:
                    value = 'esg-error'
                }
              } else {
                value = 'esg-error'
              }
            }

            if (!value) value = 'esg-error'

            break
          // (IN)EQUALITY
          case '==':
          case '!=':
            if (foundLeftVariable && foundRightVariable) {
              // booleans
              if (
                foundLeftVariable.type === VARIABLE_TYPE.BOOLEAN &&
                foundRightVariable.type === VARIABLE_TYPE.BOOLEAN
              ) {
                value =
                  operator === '=='
                    ? (foundLeftVariable.value === 'true' &&
                        foundRightVariable.value === 'true') ||
                      (foundLeftVariable.value === 'false' &&
                        foundRightVariable.value === 'false')
                      ? consequentValue
                      : alternateValue
                    : // !=
                    (foundLeftVariable.value === 'true' &&
                        foundRightVariable.value === 'false') ||
                      (foundLeftVariable.value === 'false' &&
                        foundRightVariable.value === 'true')
                    ? consequentValue
                    : alternateValue
              }

              // strings and numbers
              if (
                !value &&
                foundLeftVariable.value &&
                foundRightVariable.value
              ) {
                value =
                  operator === '=='
                    ? foundLeftVariable.value === foundRightVariable.value
                      ? consequentValue
                      : alternateValue
                    : // !=
                    foundLeftVariable.value !== foundRightVariable.value
                    ? consequentValue
                    : alternateValue
              }
            }

            if (foundLeftVariable && !foundRightVariable) {
              // booleans
              if (
                foundLeftVariable.type === VARIABLE_TYPE.BOOLEAN &&
                typeof rightVariable?.value === 'boolean'
              ) {
                value =
                  operator === '=='
                    ? (foundLeftVariable.value === 'true' &&
                        rightVariable.value) ||
                      (foundLeftVariable.value === 'false' &&
                        !rightVariable.value)
                      ? consequentValue
                      : alternateValue
                    : // !=
                    (foundLeftVariable.value === 'false' &&
                        rightVariable.value) ||
                      (foundLeftVariable.value === 'true' &&
                        !rightVariable.value)
                    ? consequentValue
                    : alternateValue
              }

              // numbers
              if (
                foundLeftVariable.type === VARIABLE_TYPE.NUMBER &&
                typeof rightVariable?.value === 'number'
              ) {
                value =
                  operator === '=='
                    ? Number(foundLeftVariable.value) === rightVariable.value
                      ? consequentValue
                      : alternateValue
                    : // !=
                    Number(foundLeftVariable.value) !== rightVariable.value
                    ? consequentValue
                    : alternateValue
              }

              // strings
              if (!value && foundLeftVariable.value && rightVariable?.value) {
                value =
                  operator === '=='
                    ? foundLeftVariable.value === rightVariable?.value
                      ? consequentValue
                      : alternateValue
                    : // !=
                    foundLeftVariable.value !== rightVariable?.value
                    ? consequentValue
                    : alternateValue
              }
            }

            if (!foundLeftVariable && foundRightVariable) {
              // booleans
              if (
                foundRightVariable.type === VARIABLE_TYPE.BOOLEAN &&
                typeof leftVariable?.value === 'boolean'
              ) {
                value =
                  operator === '=='
                    ? (foundRightVariable.value === 'true' &&
                        leftVariable.value) ||
                      (foundRightVariable.value === 'false' &&
                        !leftVariable.value)
                      ? consequentValue
                      : alternateValue
                    : // !=
                    (foundRightVariable.value === 'false' &&
                        leftVariable.value) ||
                      (foundRightVariable.value === 'true' &&
                        !leftVariable.value)
                    ? consequentValue
                    : alternateValue
              }

              // numbers
              if (
                foundRightVariable.type === VARIABLE_TYPE.NUMBER &&
                typeof leftVariable?.value === 'number'
              ) {
                value =
                  operator === '=='
                    ? Number(foundRightVariable.value) === leftVariable.value
                      ? consequentValue
                      : alternateValue
                    : // !=
                    Number(foundRightVariable.value) !== leftVariable.value
                    ? consequentValue
                    : alternateValue
              }

              // strings
              if (!value && foundRightVariable.value && leftVariable?.value) {
                value =
                  operator === '=='
                    ? foundRightVariable.value === leftVariable?.value
                      ? consequentValue
                      : alternateValue
                    : // !=
                    foundRightVariable.value !== leftVariable?.value
                    ? consequentValue
                    : alternateValue
              }
            }

            if (!value) value = 'esg-error'

            break
          default:
            value = 'esg-error'
            break
        }

        // IDENTIFIER
        if (parsedExpression.identifier?.variableName) {
          const foundVariable =
            variables[parsedExpression.identifier.variableName]

          if (foundVariable) {
            if (foundVariable.type === VARIABLE_TYPE.BOOLEAN) {
              value =
                foundVariable.value === 'true'
                  ? consequentValue
                  : alternateValue
            }

            if (foundVariable.type !== VARIABLE_TYPE.BOOLEAN) {
              value =
                foundVariable && foundVariable.value
                  ? consequentValue
                  : alternateValue
            }
          }

          if (!foundVariable) value = 'esg-error'
        }

        // UNARY
        if (
          parsedExpression.argument &&
          parsedExpression.argument.name &&
          parsedExpression.argument.type
        ) {
          const foundVariable = variables[parsedExpression.argument.name]

          if (foundVariable) {
            value =
              // boolean
              foundVariable.type === VARIABLE_TYPE.BOOLEAN
                ? foundVariable.value === 'false'
                  ? consequentValue
                  : alternateValue
                : // not boolean
                  alternateValue
          }

          if (!foundVariable) value = 'esg-error'
        }
        break
      case NODE_TYPES.EXPRESSION_ERROR:
        value = 'esg-error'
        break
      default:
        break
    }

    value = value ? `{${value}}` : ''

    processedTemplate = processedTemplate
      .split('{' + expression + '}')
      .join(value || '')
  })

  return processedTemplate.replace(/\s+/g, ' ').trim()
}

export const gameMethods = {
  lower: (value: string): string => value.toLowerCase(),
  upper: (value: string): string => value.toUpperCase()
}
