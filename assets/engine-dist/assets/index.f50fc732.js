var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { D as Dexie$1, l as lzwCompress, a as lodash, j as jsxRuntime, r as react, R as React, u as useQuery, v as v4, d as dexieReactHooks, p as parse, b as reactStringReplace, c as useSpring, e as useResizeObserver, f as animated, g as useTransition, Q as QueryClient, h as QueryClientProvider, i as reactDom } from "./vendor.4f67a139.js";
const p = function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(script) {
    const fetchOpts = {};
    if (script.integrity)
      fetchOpts.integrity = script.integrity;
    if (script.referrerpolicy)
      fetchOpts.referrerPolicy = script.referrerpolicy;
    if (script.crossorigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (script.crossorigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
};
p();
var base = ":root {\n  --text-size: 62.5%;\n  --primary-color: hsl(265, 100%, 60%);\n  --primary-color-brighter: hsl(265, 100%, 65%);\n  --primary-color-darker: hsl(265, 100%, 55%);\n  --white: hsl(0, 0%, 97%);\n  --black: hsl(0, 0%, 3%);\n  --min-interaction-height: 4.4rem;\n  --runtime-width: 680px;\n  --btn-text-color: var(--white);\n  --link-color: var(--primary-color);\n  --link-hover-color: var(--primary-color);\n  --settings-z-index: 100;\n  --title-bar-height: var(--min-interaction-height);\n  --title-bar-z-index: 10;\n}\nhtml[data-theme='BOOK'] {\n  --background-color: var(--white);\n  --text-color: var(--black);\n  --font-family: 'Literata';\n  --btn-background-color: var(--primary-color);\n  --btn-background-color-hover: var(--primary-color-brighter);\n  --btn-border: none;\n  --btn-border-hover-color: transparent;\n  --renderer-border-color: hsl(0, 0%, 92%);\n  --title-bar-background-color: var(--white);\n  --event-top-border: 0.1rem solid hsl(0, 0%, 94%);\n  --event-passage-bottom-border: 0.1rem solid hsl(0, 0%, 88%);\n  --event-past-text-color: hsl(0, 0%, 70%);\n  --event-past-choice-background-color: hsl(0, 0%, 90%);\n  --event-past-choice-border: none;\n  --event-past-choice-text-color: hsl(0, 0%, 80%);\n  --event-past-choice-result-background-color: var(--event-past-choice-background-color);\n  --event-past-choice-result-text-color: hsl(0, 0%, 40%);\n}\nhtml[data-theme='CONSOLE'] {\n  --background-color: var(--black);\n  --text-color: var(--white);\n  --font-family: 'Fira Code';\n  --btn-background-color: transparent;\n  --btn-background-color-hover: var(--primary-color-darker);\n  --btn-border: 0.1rem solid var(--primary-color);\n  --btn-border-hover-color: var(--primary-color-brighter);\n  --renderer-border-color: hsl(0, 0%, 8%);\n  --title-bar-background-color: var(--black);\n  --event-top-border: 0.1rem solid hsl(0, 0%, 6%);\n  --event-passage-bottom-border: 0.1rem solid hsl(0, 0%, 12%);\n  --event-past-text-color: hsl(0, 0%, 30%);\n  --event-past-choice-background-color: none;\n  --event-past-choice-border: 1px solid hsl(0, 0%, 10%);\n  --event-past-text-hover-color: hsl(0, 0%, 70%);\n  --event-past-choice-text-color: hsl(0, 0%, 10%);\n  --event-past-choice-result-background-color: var(--event-past-choice-background-color);\n  --event-past-choice-result-text-color: hsl(0, 0%, 60%);\n}\n#runtime {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n}\n#runtime ul {\n  list-style: none;\n}\n#runtime li {\n  margin-bottom: 1.4rem;\n}\n#runtime li:last-child {\n  margin-bottom: 0;\n}\n#runtime a {\n  color: var(--link-color);\n  cursor: pointer;\n}\n#runtime a:hover {\n  color: var(--link-hover-color);\n}\n#runtime input {\n  border: none;\n}\n#runtime button {\n  background: var(--btn-background-color);\n  border: var(--btn-border);\n  color: var(--btn-text-color);\n  min-height: var(--min-interaction-height);\n  min-width: var(--min-interaction-height);\n  text-transform: uppercase;\n  padding: 0 1.2rem;\n  border-radius: 0;\n  border-radius: 0.4rem;\n}\n#runtime button:hover {\n  background: var(--btn-background-color-hover);\n  border-color: var(--btn-border-hover-color);\n  cursor: pointer;\n}\n#runtime .engine-warning-message {\n  color: var(--warning-color);\n}\n#runtime #settings {\n  position: absolute;\n  top: 0;\n  width: 100%;\n  height: 100%;\n  background: var(--background-color);\n  z-index: var(--settings-z-index);\n}\n#runtime #settings-content {\n  padding: 1.4rem;\n}\n#runtime #settings-content a.settings-active-theme {\n  text-decoration: underline;\n}\n#runtime #renderer {\n  width: 100%;\n  height: 100%;\n}\n#runtime #title-card {\n  position: absolute;\n  top: 0;\n  width: 100%;\n  height: calc(100% - 2.4rem);\n  display: grid;\n  justify-content: center;\n  align-content: center;\n  text-align: center;\n}\n#runtime #title-card-studio-title {\n  font-size: 1.2rem;\n  margin-bottom: 2.4rem;\n}\n#runtime #title-card-game-title {\n  font-size: 3.2rem;\n  margin-bottom: 1rem;\n}\n#runtime #title-card-game-version {\n  font-size: 1.2rem;\n  margin-bottom: 2.4rem;\n}\n#runtime #title-card-game-designer {\n  margin-bottom: 4rem;\n}\n#runtime #title-card-btns button {\n  display: block;\n  width: fit-content;\n  margin: 0 auto;\n  margin-bottom: 0.6rem;\n}\n#runtime #title-card-btns button:last-child {\n  margin-bottom: 0;\n}\n#runtime #title-card-footer {\n  position: fixed;\n  bottom: 0;\n  width: 100%;\n  text-align: center;\n  height: 2.4rem;\n  line-height: 2.4rem;\n  background: var(--background-color);\n}\n#runtime .title-bar {\n  position: sticky;\n  top: 0;\n  width: 100%;\n  height: var(--title-bar-height);\n  border-bottom: 0.1rem solid var(--renderer-border-color);\n  background: var(--title-bar-background-color);\n  z-index: var(--title-bar-z-index);\n  display: inline-grid;\n}\n#runtime .title-bar-title {\n  display: block;\n  text-align: center;\n  line-height: var(--title-bar-height);\n  font-size: 1.2rem;\n}\n#runtime .title-bar button {\n  background: transparent;\n  border: none;\n}\n#runtime .title-bar button path {\n  fill: var(--primary-color);\n}\n#runtime .title-bar button:hover path {\n  fill: var(--primary-color-brighter);\n}\n#runtime #settings-title-bar {\n  display: block;\n}\n#runtime #settings-title-bar button {\n  position: absolute;\n  top: 0;\n  right: 0;\n}\n#runtime #event-stream-title-bar {\n  grid-template-columns: var(--title-bar-height) 1fr var(--title-bar-height);\n}\n#runtime #event-stream {\n  position: absolute;\n  top: var(--title-bar-height);\n  bottom: 0;\n  overflow-y: auto;\n  overflow-x: hidden;\n  width: 100%;\n  margin: 0 auto;\n}\n#runtime #events {\n  display: flex;\n  flex-direction: column-reverse;\n  justify-content: flex-start;\n  min-height: 100%;\n}\n#runtime .event {\n  overflow: hidden;\n}\n#runtime .event-past {\n  color: var(--event-past-text-color);\n}\n#runtime .event-passage {\n  padding: 1.4rem 1rem;\n  border-bottom: var(--event-passage-bottom-border);\n  height: auto;\n}\n#runtime .event-passage .expression {\n  border-bottom: 1px dashed var(--primary-color);\n}\n#runtime .event-passage .expression-error {\n  border-bottom: 1px dashed red;\n}\n#runtime .event-passage p {\n  margin-bottom: 1.4rem;\n  line-height: 2.8rem;\n}\n#runtime .event-passage p:last-child {\n  margin-bottom: 0;\n}\n#runtime .event-choices,\n#runtime .event-input-result {\n  display: grid;\n  justify-items: right;\n  padding: 1.4rem;\n}\n#runtime .event-choice {\n  margin-bottom: 0.6rem;\n}\n#runtime .event-choice:last-child {\n  margin-bottom: 0;\n}\n#runtime .event-loopback-btn-content {\n  display: inline-block;\n  vertical-align: middle;\n  padding-right: 0.6rem;\n}\n#runtime .event-choice button:disabled,\n#runtime .event-loopback-btn button:disabled {\n  cursor: not-allowed;\n  color: var(--event-past-choice-text-color);\n  background: var(--event-past-choice-background-color);\n  border: var(--event-past-choice-border);\n}\n#runtime .event-choice-result button:disabled,\n#runtime .event-input-result button:disabled {\n  color: var(--event-past-choice-result-text-color);\n  background: var(--event-past-choice-result-background-color);\n}\n#runtime .event-choice .closed-route {\n  border: 1px dashed var(--warning-color) !important;\n  color: var(--warning-color) !important;\n}\n#runtime .event-input-result button:disabled {\n  cursor: not-allowed;\n  border: var(--event-past-choice-border);\n}\n#runtime .event-input {\n  width: 100%;\n}\n#runtime .event-input form {\n  width: 100%;\n  display: inline-grid;\n  grid-template-columns: 1fr var(--min-interaction-height);\n}\n#runtime .event-input form input {\n  height: var(--min-interaction-height);\n  background: transparent;\n  color: var(--text-color);\n}\n#runtime .event-input form button {\n  width: var(--min-interaction-height);\n  border-radius: 0;\n  border: none;\n  background: transparent;\n}\n#runtime .event-input form button path {\n  fill: var(--primary-color);\n}\n#runtime .event-input form button:hover {\n  background: transparent;\n}\n#runtime .event-input form button:hover path {\n  fill: var(--primary-color-brighter);\n}\n#runtime .event-result {\n  width: 100%;\n  text-align: right;\n  color: var(--primary-color);\n  font-size: 1.2rem;\n}\n#runtime .event-result-date {\n  font-size: 1rem;\n  color: var(--event-past-text-color);\n}\n@font-face {\n  font-family: Literata;\n  src: url(__VITE_ASSET__85873a2b__);\n}\n@font-face {\n  font-family: 'Fira Code';\n  src: url(__VITE_ASSET__16865a4d__);\n}\n::-webkit-scrollbar {\n  width: 4px;\n  height: 44px;\n}\n::-webkit-scrollbar-thumb {\n  background-color: var(--primary-color);\n}\n::-webkit-scrollbar-thumb:hover {\n  background-color: var(--primary-color-brighter);\n}\n::-webkit-scrollbar-track {\n  border-left: 0.1rem solid var(--renderer-border-color);\n}\nhtml {\n  font-size: var(--text-size);\n}\n* {\n  margin: 0;\n  padding: 0;\n  user-select: none;\n  font-family: var(--font-family);\n  border: none;\n}\n*:focus {\n  outline: none;\n}\nbody {\n  background: var(--background-color);\n  color: var(--text-color);\n  font-size: 1.6rem;\n  overflow: hidden;\n}\n@media only screen and (min-width: 680px) {\n  #runtime {\n    position: absolute;\n    left: 50%;\n    transform: translate(-50%, 0%);\n    width: var(--runtime-width);\n    border-left: 1px solid var(--renderer-border-color);\n    border-right: 1px solid var(--renderer-border-color);\n    height: 100%;\n  }\n}\n";
var LIBRARY_TABLE;
(function(LIBRARY_TABLE2) {
  LIBRARY_TABLE2["BOOKMARKS"] = "bookmarks";
  LIBRARY_TABLE2["CHOICES"] = "choices";
  LIBRARY_TABLE2["CONDITIONS"] = "conditions";
  LIBRARY_TABLE2["EFFECTS"] = "effects";
  LIBRARY_TABLE2["EVENTS"] = "events";
  LIBRARY_TABLE2["GAMES"] = "games";
  LIBRARY_TABLE2["INPUTS"] = "inputs";
  LIBRARY_TABLE2["JUMPS"] = "jumps";
  LIBRARY_TABLE2["PASSAGES"] = "passages";
  LIBRARY_TABLE2["ROUTES"] = "routes";
  LIBRARY_TABLE2["SCENES"] = "scenes";
  LIBRARY_TABLE2["SETTINGS"] = "settings";
  LIBRARY_TABLE2["VARIABLES"] = "variables";
})(LIBRARY_TABLE || (LIBRARY_TABLE = {}));
const DB_NAME = "esg-library";
class LibraryDatabase extends Dexie$1 {
  constructor(studioId) {
    super(`${DB_NAME}-${studioId}`);
    __publicField(this, "bookmarks");
    __publicField(this, "choices");
    __publicField(this, "conditions");
    __publicField(this, "effects");
    __publicField(this, "events");
    __publicField(this, "games");
    __publicField(this, "inputs");
    __publicField(this, "jumps");
    __publicField(this, "passages");
    __publicField(this, "routes");
    __publicField(this, "scenes");
    __publicField(this, "settings");
    __publicField(this, "variables");
    this.version(6).stores({
      bookmarks: "&id,gameId,event,updated",
      choices: "&id,gameId,passageId",
      conditions: "&id,gameId,routeId,variableId",
      effects: "&id,gameId,routeId,variableId",
      events: "&id,gameId,destination,origin,prev,next,type,updated,[gameId+updated]",
      games: "&id,title,*tags,updated,template,designer,version,engine",
      inputs: "&id,gameId,passageId,variableId",
      jumps: "&id,gameId,sceneId",
      passages: "&id,gameId,gameOver,sceneId",
      routes: "&id,gameId,sceneId,originId,choiceId,inputId,originType,destinationId,destinationType",
      scenes: "&id,gameId,children",
      settings: "&id,gameId",
      variables: "&id,gameId,type"
    });
    this.bookmarks = this.table(LIBRARY_TABLE.BOOKMARKS);
    this.choices = this.table(LIBRARY_TABLE.CHOICES);
    this.conditions = this.table(LIBRARY_TABLE.CONDITIONS);
    this.effects = this.table(LIBRARY_TABLE.EFFECTS);
    this.events = this.table(LIBRARY_TABLE.EVENTS);
    this.games = this.table(LIBRARY_TABLE.GAMES);
    this.inputs = this.table(LIBRARY_TABLE.INPUTS);
    this.jumps = this.table(LIBRARY_TABLE.JUMPS);
    this.passages = this.table(LIBRARY_TABLE.PASSAGES);
    this.routes = this.table(LIBRARY_TABLE.ROUTES);
    this.scenes = this.table(LIBRARY_TABLE.SCENES);
    this.settings = this.table(LIBRARY_TABLE.SETTINGS);
    this.variables = this.table(LIBRARY_TABLE.VARIABLES);
  }
  async saveBookmarkCollectionData(bookmarkCollection) {
    try {
      await this.transaction("rw", this.bookmarks, async () => await Promise.all([Object.keys(bookmarkCollection).map(async (key) => await this.bookmarks.add(bookmarkCollection[key], bookmarkCollection[key].id))]));
    } catch (error) {
      throw error;
    }
  }
  async saveChoiceCollectionData(gameId, choiceCollection) {
    try {
      await this.transaction("rw", this.choices, async () => await Promise.all([Object.keys(choiceCollection).map(async (key) => await this.choices.add(__spreadProps(__spreadValues({}, choiceCollection[key]), {
        gameId
      }), choiceCollection[key].id))]));
    } catch (error) {
      throw error;
    }
  }
  async saveConditionCollectionData(gameId, conditionCollection) {
    try {
      await this.transaction("rw", this.conditions, async () => await Promise.all([Object.keys(conditionCollection).map(async (key) => await this.conditions.add(__spreadProps(__spreadValues({}, conditionCollection[key]), {
        gameId
      }), conditionCollection[key].id))]));
    } catch (error) {
      throw error;
    }
  }
  async saveEffectCollectionData(gameId, effectCollection) {
    try {
      await this.transaction("rw", this.effects, async () => await Promise.all([Object.keys(effectCollection).map(async (key) => await this.effects.add(__spreadProps(__spreadValues({}, effectCollection[key]), {
        gameId
      }), effectCollection[key].id))]));
    } catch (error) {
      throw error;
    }
  }
  async saveEventCollectionData(gameId, eventCollection) {
    try {
      await this.transaction("rw", this.events, async () => await Promise.all([Object.keys(eventCollection).map(async (key) => await this.events.add(__spreadProps(__spreadValues({}, eventCollection[key]), {
        gameId
      }), eventCollection[key].id))]));
    } catch (error) {
      throw error;
    }
  }
  async saveGameData(gameData) {
    try {
      await this.transaction("rw", this.games, async () => await this.games.add(gameData, gameData.id));
    } catch (error) {
      throw error;
    }
  }
  async saveInputCollectionData(gameId, inputCollection) {
    try {
      await this.transaction("rw", this.inputs, async () => await Promise.all([Object.keys(inputCollection).map(async (key) => await this.inputs.add(__spreadProps(__spreadValues({}, inputCollection[key]), {
        gameId
      }), inputCollection[key].id))]));
    } catch (error) {
      throw error;
    }
  }
  async saveJumpCollectionData(gameId, jumpCollection) {
    try {
      await this.transaction("rw", this.jumps, async () => await Promise.all([Object.keys(jumpCollection).map(async (key) => await this.jumps.add(__spreadProps(__spreadValues({}, jumpCollection[key]), {
        gameId
      }), jumpCollection[key].id))]));
    } catch (error) {
      throw error;
    }
  }
  async savePassageCollectionData(gameId, passageCollection) {
    try {
      await this.transaction("rw", this.passages, async () => await Promise.all([Object.keys(passageCollection).map(async (key) => await this.passages.add(__spreadProps(__spreadValues({}, passageCollection[key]), {
        gameId
      }), passageCollection[key].id))]));
    } catch (error) {
      throw error;
    }
  }
  async saveRouteCollectionData(gameId, routeCollection) {
    try {
      await this.transaction("rw", this.routes, async () => await Promise.all([Object.keys(routeCollection).map(async (key) => await this.routes.add(__spreadProps(__spreadValues({}, routeCollection[key]), {
        gameId
      }), routeCollection[key].id))]));
    } catch (error) {
      throw error;
    }
  }
  async saveSceneCollectionData(gameId, sceneCollection) {
    try {
      await this.transaction("rw", this.scenes, async () => await Promise.all([Object.keys(sceneCollection).map(async (key) => await this.scenes.add(__spreadProps(__spreadValues({}, sceneCollection[key]), {
        gameId
      }), sceneCollection[key].id))]));
    } catch (error) {
      throw error;
    }
  }
  async saveSettingCollectionData(settingsCollection, update) {
    try {
      await this.transaction("rw", this.settings, async () => await Promise.all([Object.keys(settingsCollection).map(async (key) => !update ? await this.settings.add(settingsCollection[key], settingsCollection[key].id) : await this.settings.update(key, settingsCollection[key]))]));
    } catch (error) {
      throw error;
    }
  }
  async saveVariableCollectionData(gameId, variableCollection) {
    try {
      await this.transaction("rw", this.variables, async () => await Promise.all([Object.keys(variableCollection).map(async (key) => await this.variables.add(__spreadProps(__spreadValues({}, variableCollection[key]), {
        gameId
      }), variableCollection[key].id))]));
    } catch (error) {
      throw error;
    }
  }
}
var COMPONENT_TYPE;
(function(COMPONENT_TYPE2) {
  COMPONENT_TYPE2["STUDIO"] = "STUDIO";
  COMPONENT_TYPE2["GAME"] = "GAME";
  COMPONENT_TYPE2["JUMP"] = "JUMP";
  COMPONENT_TYPE2["FOLDER"] = "FOLDER";
  COMPONENT_TYPE2["SCENE"] = "SCENE";
  COMPONENT_TYPE2["ROUTE"] = "ROUTE";
  COMPONENT_TYPE2["PASSAGE"] = "PASSAGE";
  COMPONENT_TYPE2["CHOICE"] = "CHOICE";
  COMPONENT_TYPE2["INPUT"] = "INPUT";
  COMPONENT_TYPE2["CONDITION"] = "CONDITION";
  COMPONENT_TYPE2["EFFECT"] = "EFFECT";
  COMPONENT_TYPE2["VARIABLE"] = "VARIABLE";
})(COMPONENT_TYPE || (COMPONENT_TYPE = {}));
var COMPARE_OPERATOR_TYPE;
(function(COMPARE_OPERATOR_TYPE2) {
  COMPARE_OPERATOR_TYPE2["EQ"] = "=";
  COMPARE_OPERATOR_TYPE2["NE"] = "!=";
  COMPARE_OPERATOR_TYPE2["GTE"] = ">=";
  COMPARE_OPERATOR_TYPE2["GT"] = ">";
  COMPARE_OPERATOR_TYPE2["LT"] = "<";
  COMPARE_OPERATOR_TYPE2["LTE"] = "<=";
})(COMPARE_OPERATOR_TYPE || (COMPARE_OPERATOR_TYPE = {}));
var SET_OPERATOR_TYPE;
(function(SET_OPERATOR_TYPE2) {
  SET_OPERATOR_TYPE2["ASSIGN"] = "=";
  SET_OPERATOR_TYPE2["ADD"] = "+";
  SET_OPERATOR_TYPE2["SUBTRACT"] = "-";
  SET_OPERATOR_TYPE2["MULTIPLY"] = "*";
  SET_OPERATOR_TYPE2["DIVIDE"] = "/";
})(SET_OPERATOR_TYPE || (SET_OPERATOR_TYPE = {}));
var PASSAGE_TYPE;
(function(PASSAGE_TYPE2) {
  PASSAGE_TYPE2["CHOICE"] = "CHOICE";
  PASSAGE_TYPE2["INPUT"] = "INPUT";
})(PASSAGE_TYPE || (PASSAGE_TYPE = {}));
var VARIABLE_TYPE;
(function(VARIABLE_TYPE2) {
  VARIABLE_TYPE2["STRING"] = "STRING";
  VARIABLE_TYPE2["NUMBER"] = "NUMBER";
  VARIABLE_TYPE2["BOOLEAN"] = "BOOLEAN";
  VARIABLE_TYPE2["IMAGE"] = "IMAGE";
  VARIABLE_TYPE2["URL"] = "URL";
})(VARIABLE_TYPE || (VARIABLE_TYPE = {}));
var ENGINE_THEME;
(function(ENGINE_THEME2) {
  ENGINE_THEME2["BOOK"] = "BOOK";
  ENGINE_THEME2["CONSOLE"] = "CONSOLE";
})(ENGINE_THEME || (ENGINE_THEME = {}));
var ENGINE_DEVTOOLS_EVENT_TYPE;
(function(ENGINE_DEVTOOLS_EVENT_TYPE2) {
  ENGINE_DEVTOOLS_EVENT_TYPE2["OPEN_PASSAGE"] = "OPEN_PASSAGE";
  ENGINE_DEVTOOLS_EVENT_TYPE2["RESET"] = "RESET";
  ENGINE_DEVTOOLS_EVENT_TYPE2["TOGGLE_EXPRESSIONS"] = "TOGGLE_EXPRESSIONS";
  ENGINE_DEVTOOLS_EVENT_TYPE2["TOGGLE_BLOCKED_CHOICES"] = "TOGGLE_BLOCKED_CHOICES";
  ENGINE_DEVTOOLS_EVENT_TYPE2["TOGGLE_XRAY"] = "TOGGLE_XRAY";
})(ENGINE_DEVTOOLS_EVENT_TYPE || (ENGINE_DEVTOOLS_EVENT_TYPE = {}));
var ENGINE_DEVTOOLS_EVENTS;
(function(ENGINE_DEVTOOLS_EVENTS2) {
  ENGINE_DEVTOOLS_EVENTS2["EDITOR_TO_ENGINE"] = "editor:engine:devtools:event";
  ENGINE_DEVTOOLS_EVENTS2["ENGINE_TO_EDITOR"] = "engine:editor:devtools:event";
})(ENGINE_DEVTOOLS_EVENTS || (ENGINE_DEVTOOLS_EVENTS = {}));
var ENGINE_EVENT_TYPE;
(function(ENGINE_EVENT_TYPE2) {
  ENGINE_EVENT_TYPE2["GAME_OVER"] = "GAME_OVER";
  ENGINE_EVENT_TYPE2["CHOICE"] = "CHOICE";
  ENGINE_EVENT_TYPE2["CHOICE_LOOPBACK"] = "CHOICE_LOOPBACK";
  ENGINE_EVENT_TYPE2["INITIAL"] = "INITIAL";
  ENGINE_EVENT_TYPE2["INPUT"] = "INPUT";
  ENGINE_EVENT_TYPE2["INPUT_LOOPBACK"] = "INPUT_LOOPBACK";
  ENGINE_EVENT_TYPE2["RESTART"] = "RESTART";
})(ENGINE_EVENT_TYPE || (ENGINE_EVENT_TYPE = {}));
const AUTO_ENGINE_BOOKMARK_KEY = "___auto___";
const INITIAL_ENGINE_EVENT_ORIGIN_KEY = "___initial___";
const ENGINE_EVENT_LOOPBACK_RESULT_VALUE = "___loopback___";
const ENGINE_EVENT_PASSTHROUGH_RESULT_VALUE = "___passthrough___";
const ENGINE_EVENT_GAME_OVER_RESULT_VALUE = "___gameover___";
const DEFAULT_ENGINE_SETTINGS_KEY = "__default__";
const scrollElementToBottom = (element, smooth) => element.scrollIntoView({
  block: "end",
  behavior: smooth ? "smooth" : "auto"
});
const getGameInfo = async (studioId, gameId) => {
  try {
    const foundGame = await new LibraryDatabase(studioId).games.get(gameId);
    if (foundGame) {
      return foundGame;
    }
  } catch (error) {
    throw error;
  }
  return null;
};
const saveGameMeta = (studioId, gameId) => {
  if (!localStorage.getItem(gameId))
    localStorage.setItem(gameId, JSON.stringify({
      gameId,
      studioId
    }));
};
const saveEngineCollectionData = async (engineData) => {
  const {
    children,
    designer,
    engine,
    id: gameId,
    jump,
    schema,
    studioId,
    studioTitle,
    tags,
    title,
    updated,
    version
  } = engineData._;
  const databaseExists = await Dexie$1.exists(`${DB_NAME}-${studioId}`);
  if (!databaseExists) {
    saveGameMeta(studioId, gameId);
    const libraryDatabase = new LibraryDatabase(studioId);
    try {
      await Promise.all([libraryDatabase.saveChoiceCollectionData(gameId, engineData.choices), libraryDatabase.saveConditionCollectionData(gameId, engineData.conditions), libraryDatabase.saveEffectCollectionData(gameId, engineData.effects), libraryDatabase.saveGameData({
        children,
        designer,
        engine,
        id: gameId,
        jump,
        schema,
        studioId,
        studioTitle,
        tags,
        title,
        updated,
        version
      }), libraryDatabase.saveInputCollectionData(gameId, engineData.inputs), libraryDatabase.saveJumpCollectionData(gameId, engineData.jumps), libraryDatabase.savePassageCollectionData(gameId, engineData.passages), libraryDatabase.saveRouteCollectionData(gameId, engineData.routes), libraryDatabase.saveSceneCollectionData(gameId, engineData.scenes), libraryDatabase.saveVariableCollectionData(gameId, engineData.variables)]);
      await saveEngineDefaultGameCollectionData(studioId, gameId);
    } catch (error) {
      throw error;
    }
  }
};
const saveEngineDefaultGameCollectionData = async (studioId, gameId) => {
  const libraryDatabase = new LibraryDatabase(studioId);
  try {
    const [existingAutoBookmark, existingDefaultSettings, existingInitialEvent] = await Promise.all([libraryDatabase.bookmarks.get(`${AUTO_ENGINE_BOOKMARK_KEY}${gameId}`), libraryDatabase.settings.get(`${DEFAULT_ENGINE_SETTINGS_KEY}${gameId}`), libraryDatabase.events.get(`${INITIAL_ENGINE_EVENT_ORIGIN_KEY}${gameId}`)]);
    let promises = [];
    if (!existingAutoBookmark) {
      promises.push(libraryDatabase.saveBookmarkCollectionData({
        AUTO_ENGINE_BOOKMARK_KEY: {
          gameId,
          id: `${AUTO_ENGINE_BOOKMARK_KEY}${gameId}`,
          title: AUTO_ENGINE_BOOKMARK_KEY,
          event: void 0,
          updated: Date.now()
        }
      }));
    }
    if (!existingDefaultSettings) {
      promises.push(libraryDatabase.saveSettingCollectionData({
        DEFAULT_ENGINE_SETTINGS: {
          gameId,
          id: `${DEFAULT_ENGINE_SETTINGS_KEY}${gameId}`,
          theme: ENGINE_THEME.BOOK
        }
      }));
    }
    await Promise.all(promises);
    if (!existingInitialEvent) {
      const variablesArr = await libraryDatabase.variables.where({
        gameId
      }).toArray();
      let variables = {};
      variablesArr.map((variable) => variables[variable.id] = lodash.exports.cloneDeep(variable));
      const initialGameState = {};
      Object.keys(variables).map((key) => {
        const {
          title,
          type,
          initialValue
        } = lodash.exports.pick(variables[key], ["title", "type", "initialValue"]);
        initialGameState[key] = {
          gameId,
          title,
          type,
          value: initialValue
        };
      });
      const startingDestination = await findStartingDestinationPassage(studioId, gameId);
      if (startingDestination) {
        await libraryDatabase.saveEventCollectionData(gameId, {
          INITIAL_ENGINE_EVENT: {
            gameId,
            id: `${INITIAL_ENGINE_EVENT_ORIGIN_KEY}${gameId}`,
            destination: startingDestination,
            state: initialGameState,
            type: ENGINE_EVENT_TYPE.INITIAL,
            updated: Date.now()
          }
        });
      }
    }
  } catch (error) {
    throw error;
  }
};
const unpackEngineData = (packedEngineData) => lzwCompress.unpack(packedEngineData);
const resetGame = async (studioId, gameId, skipInstall) => {
  try {
    const libraryDatabase = new LibraryDatabase(studioId);
    try {
      await Promise.all([libraryDatabase.bookmarks.where({
        gameId
      }).delete(), libraryDatabase.events.where({
        gameId
      }).delete(), libraryDatabase.settings.where({
        gameId
      }).delete()]);
      !skipInstall && await saveEngineDefaultGameCollectionData(studioId, gameId);
    } catch (error) {
      throw error;
    }
  } catch (error) {
    throw error;
  }
};
const findStartingDestinationPassage = async (studioId, gameId) => {
  const libraryDatabase = new LibraryDatabase(studioId), game = await libraryDatabase.games.get(gameId);
  if (game) {
    try {
      if (game.jump) {
        const foundJump = await libraryDatabase.jumps.get(game.jump);
        if (foundJump) {
          if (foundJump.route[1]) {
            return foundJump.route[1];
          }
          if (!foundJump.route[1] && foundJump.route[0]) {
            const foundScene = await libraryDatabase.scenes.get(foundJump.route[0]);
            if (!foundScene)
              return void 0;
            if (foundScene.children.length > 0 && foundScene.children[0][1]) {
              return foundScene.children[0][1];
            }
          }
        }
      }
      if (!game.jump) {
        const libraryDatabase2 = new LibraryDatabase(studioId), foundScene = game.children[0] && game.children[0][0] !== COMPONENT_TYPE.FOLDER ? await libraryDatabase2.scenes.get(game.children[0][1]) : await libraryDatabase2.scenes.where({
          gameId
        }).first();
        if (!foundScene)
          return void 0;
        if (foundScene.children.length > 0 && foundScene.children[0][1]) {
          return foundScene.children[0][1];
        }
      }
      return void 0;
    } catch (error) {
      throw error;
    }
  } else {
    throw "Unable to find starting location. Missing game info.";
  }
};
const findDestinationPassage = async (studioId, destinationId, destinationType) => {
  let foundLocation;
  switch (destinationType) {
    case COMPONENT_TYPE.PASSAGE:
      const foundPassage = await getPassage(studioId, destinationId);
      if (foundPassage) {
        foundLocation = foundPassage.id;
      }
      break;
    case COMPONENT_TYPE.JUMP:
      const foundJump = await getJump(studioId, destinationId);
      if (foundJump && foundJump.route[0]) {
        if (foundJump.route[1]) {
          foundLocation = foundJump.route[1];
        }
        if (!foundJump.route[1]) {
          const foundScene = await getScene(studioId, foundJump.route[0]);
          if (foundScene == null ? void 0 : foundScene.children[0][1]) {
            foundLocation = foundScene.children[0][1];
          }
        }
      }
      break;
  }
  if (foundLocation) {
    return foundLocation;
  } else {
    throw "Unable to find destination. Missing passage.";
  }
};
const getBookmarkAuto = async (studioId, gameId) => {
  try {
    return await new LibraryDatabase(studioId).bookmarks.get(`${AUTO_ENGINE_BOOKMARK_KEY}${gameId}`);
  } catch (error) {
    throw error;
  }
};
const saveBookmarkEvent = async (studioId, bookmarkId, eventId) => {
  try {
    const libraryDatabase = new LibraryDatabase(studioId), foundBookmark = await libraryDatabase.bookmarks.get(bookmarkId);
    let updatedBookmark;
    if (foundBookmark) {
      updatedBookmark = __spreadProps(__spreadValues({}, foundBookmark), {
        event: eventId,
        updated: Date.now()
      });
      await libraryDatabase.bookmarks.update(bookmarkId, updatedBookmark);
      return updatedBookmark;
    }
    return void 0;
  } catch (error) {
    throw error;
  }
};
const getConditionsByRoutes = async (studioId, routeIds) => {
  try {
    return await new LibraryDatabase(studioId).conditions.where("routeId").anyOf(routeIds).toArray();
  } catch (error) {
    throw error;
  }
};
const getEffectsByRouteRef = async (studioId, routeId) => {
  try {
    return await new LibraryDatabase(studioId).effects.where({
      routeId
    }).toArray();
  } catch (error) {
    throw error;
  }
};
const processEffectsByRoute = async (studioId, routeId, state) => {
  const effects = await getEffectsByRouteRef(studioId, routeId);
  if (effects.length > 0) {
    const newState = lodash.exports.cloneDeep(state);
    effects.map((effect) => {
      if (effect.id && newState[effect.variableId]) {
        switch (effect.set[1]) {
          case SET_OPERATOR_TYPE.ASSIGN:
            newState[effect.variableId].value = effect.set[2];
            break;
          case SET_OPERATOR_TYPE.ADD:
            newState[effect.variableId].value = `${Number(newState[effect.variableId].value) + Number(effect.set[2])}`;
            break;
          case SET_OPERATOR_TYPE.SUBTRACT:
            newState[effect.variableId].value = `${Number(newState[effect.variableId].value) - Number(effect.set[2])}`;
            break;
          case SET_OPERATOR_TYPE.MULTIPLY:
            newState[effect.variableId].value = `${Number(newState[effect.variableId].value) * Number(effect.set[2])}`;
            break;
          case SET_OPERATOR_TYPE.DIVIDE:
            newState[effect.variableId].value = `${Number(newState[effect.variableId].value) / Number(effect.set[2])}`;
            break;
        }
      }
    });
    return newState;
  } else {
    return state;
  }
};
const saveEvent = async (studioId, eventData) => {
  try {
    await new LibraryDatabase(studioId).events.add(eventData);
  } catch (error) {
    throw error;
  }
};
const saveEventDestination = async (studioId, eventId, destination) => {
  try {
    const libraryDatabase = new LibraryDatabase(studioId), foundEvent = await libraryDatabase.events.get(eventId);
    if (foundEvent) {
      await libraryDatabase.events.update(eventId, __spreadProps(__spreadValues({}, foundEvent), {
        destination
      }));
    }
  } catch (error) {
    throw error;
  }
};
const saveEventNext = async (studioId, eventId, nextEventId) => {
  try {
    const libraryDatabase = new LibraryDatabase(studioId), foundEvent = await libraryDatabase.events.get(eventId);
    if (foundEvent) {
      await libraryDatabase.events.update(eventId, __spreadProps(__spreadValues({}, foundEvent), {
        next: nextEventId
      }));
    }
  } catch (error) {
    throw error;
  }
};
const saveEventResult = async (studioId, eventId, result) => {
  try {
    const libraryDatabase = new LibraryDatabase(studioId), foundEvent = await libraryDatabase.events.get(eventId);
    if (foundEvent) {
      await libraryDatabase.events.update(eventId, __spreadProps(__spreadValues({}, foundEvent), {
        result,
        updated: Date.now()
      }));
    }
  } catch (error) {
    throw error;
  }
};
const saveEventState = async (studioId, eventId, state) => {
  try {
    const libraryDatabase = new LibraryDatabase(studioId), foundEvent = await libraryDatabase.events.get(eventId);
    if (foundEvent) {
      await libraryDatabase.events.update(eventId, __spreadProps(__spreadValues({}, foundEvent), {
        state,
        updated: Date.now()
      }));
    }
  } catch (error) {
    throw error;
  }
};
const saveEventDate = async (studioId, eventId, date) => {
  try {
    const libraryDatabase = new LibraryDatabase(studioId), foundEvent = await libraryDatabase.events.get(eventId);
    if (foundEvent) {
      await libraryDatabase.events.update(eventId, __spreadProps(__spreadValues({}, foundEvent), {
        updated: date || Date.now()
      }));
    }
  } catch (error) {
    throw error;
  }
};
const getRecentEvents = async (studioId, gameId, fromEventId, history) => {
  const libraryDatabase = new LibraryDatabase(studioId);
  try {
    let recentEvents = [];
    const orderedEvents = await libraryDatabase.events.where("[gameId+updated]").between([gameId, Dexie$1.minKey], [gameId, Dexie$1.maxKey]).limit(history || 10).reverse().toArray(), mostRecentEventIndex = orderedEvents.findIndex((event) => event.id === fromEventId);
    const restartIndex = orderedEvents.findIndex((event) => event.type === ENGINE_EVENT_TYPE.RESTART);
    if (mostRecentEventIndex !== -1) {
      recentEvents = restartIndex !== -1 ? orderedEvents.slice(mostRecentEventIndex, restartIndex + 1) : orderedEvents;
    }
    return recentEvents;
  } catch (error) {
    throw error;
  }
};
const getEventInitial = async (studioId, gameId) => {
  try {
    return await new LibraryDatabase(studioId).events.get(`${INITIAL_ENGINE_EVENT_ORIGIN_KEY}${gameId}`);
  } catch (error) {
    throw error;
  }
};
const getEvent = async (studioId, eventId) => {
  try {
    return await new LibraryDatabase(studioId).events.get(eventId);
  } catch (error) {
    throw error;
  }
};
const getJump = async (studioId, jumpId) => {
  try {
    return await new LibraryDatabase(studioId).jumps.get(jumpId);
  } catch (error) {
    throw error;
  }
};
const getPassage = async (studioId, passageId) => {
  try {
    return await new LibraryDatabase(studioId).passages.get(passageId);
  } catch (error) {
    throw error;
  }
};
const getChoicesFromPassageWithOpenRoute = async (studioId, choices, state, includeAll) => {
  const choicesFromPassage = choices, openRoutes = {};
  const _choices = await Promise.all(choicesFromPassage.map(async (choice) => {
    const routesFromChoice = await getRoutesFromChoice(studioId, choice.id);
    if (routesFromChoice) {
      const openRoute = await findOpenRoute(studioId, routesFromChoice, state);
      if (openRoute) {
        openRoutes[choice.id] = lodash.exports.cloneDeep(openRoute);
        return choice;
      }
    }
    return includeAll ? choice : void 0;
  }));
  const filteredChoices = _choices.filter((choice) => choice !== void 0);
  return {
    filteredChoices,
    openRoutes
  };
};
const getRoutesFromChoice = async (studioId, choiceId) => {
  try {
    return await new LibraryDatabase(studioId).routes.where({
      choiceId
    }).toArray();
  } catch (error) {
    throw error;
  }
};
const getRoutesFromInput = async (studioId, inputId) => {
  try {
    return await new LibraryDatabase(studioId).routes.where({
      inputId
    }).toArray();
  } catch (error) {
    throw error;
  }
};
const findOpenRoute = async (studioId, routes, eventState) => {
  const routeIds = routes.map((route) => route.id), conditionsByRoutes = await getConditionsByRoutes(studioId, routeIds), openRoutes = [];
  if (conditionsByRoutes) {
    await Promise.all(routes.map(async (route) => {
      const routeOpen = await isRouteOpen(studioId, lodash.exports.cloneDeep(eventState), conditionsByRoutes.filter((condition) => condition.routeId === route.id));
      routeOpen && openRoutes.push(lodash.exports.cloneDeep(route));
    }));
  }
  return openRoutes.length > 0 ? openRoutes[openRoutes.length * Math.random() | 0] : void 0;
};
const isRouteOpen = async (studioId, eventState, conditions) => {
  let isOpen = conditions.length === 0 ? true : false;
  const variableIdsFromConditions = conditions.map((condition) => condition.variableId);
  let variablesFromConditions;
  try {
    variablesFromConditions = await new LibraryDatabase(studioId).variables.where("id").anyOf(variableIdsFromConditions).toArray();
  } catch (error) {
    throw error;
  }
  conditions.length > 0 && conditions.map((condition) => {
    const foundVariable = variablesFromConditions.find((variable) => variable.id === condition.compare[1]);
    const currentValue = foundVariable && foundVariable.type === VARIABLE_TYPE.NUMBER ? Number(eventState[condition.compare[0]].value) : eventState[condition.compare[0]].value;
    switch (condition.compare[1]) {
      case COMPARE_OPERATOR_TYPE.EQ:
        isOpen = currentValue === `${condition.compare[2]}`;
        break;
      case COMPARE_OPERATOR_TYPE.GT:
        isOpen = currentValue > condition.compare[2];
        break;
      case COMPARE_OPERATOR_TYPE.GTE:
        isOpen = currentValue >= condition.compare[2];
        break;
      case COMPARE_OPERATOR_TYPE.LT:
        isOpen = currentValue < condition.compare[2];
        break;
      case COMPARE_OPERATOR_TYPE.LTE:
        isOpen = currentValue <= condition.compare[2];
        break;
      case COMPARE_OPERATOR_TYPE.NE:
        isOpen = currentValue !== condition.compare[2];
        break;
    }
  });
  return isOpen;
};
const getScene = async (studioId, sceneId) => {
  try {
    return await new LibraryDatabase(studioId).scenes.get(sceneId);
  } catch (error) {
    throw error;
  }
};
const saveThemeSetting = async (studioId, gameId, theme) => {
  try {
    const libraryDatabase = new LibraryDatabase(studioId), foundSettings = await libraryDatabase.settings.get(`${DEFAULT_ENGINE_SETTINGS_KEY}${gameId}`);
    if (foundSettings) {
      await libraryDatabase.settings.update(`${DEFAULT_ENGINE_SETTINGS_KEY}${gameId}`, __spreadProps(__spreadValues({}, foundSettings), {
        theme
      }));
    } else {
      throw "Unable to save theme setting. Missing settings.";
    }
  } catch (error) {
    throw error;
  }
};
const getThemeSetting = async (studioId, gameId) => {
  var _a;
  try {
    return (_a = await new LibraryDatabase(studioId).settings.get(`${DEFAULT_ENGINE_SETTINGS_KEY}${gameId}`)) == null ? void 0 : _a.theme;
  } catch (error) {
    throw error;
  }
};
const jsx = jsxRuntime.exports.jsx;
const jsxs = jsxRuntime.exports.jsxs;
const Fragment = jsxRuntime.exports.Fragment;
var ENGINE_ACTION_TYPE;
(function(ENGINE_ACTION_TYPE2) {
  ENGINE_ACTION_TYPE2["APPEND_EVENTS_TO_STREAM"] = "APPEND_EVENTS_TO_STREAM";
  ENGINE_ACTION_TYPE2["CLEAR_EVENT_STREAM"] = "CLEAR_EVENT_STREAM";
  ENGINE_ACTION_TYPE2["SET_GAME_INFO"] = "SET_GAME_INFO";
  ENGINE_ACTION_TYPE2["HIDE_RESET_NOTIFICATION"] = "HIDE_RESET_NOTIFICATION";
  ENGINE_ACTION_TYPE2["PLAY"] = "PLAY";
  ENGINE_ACTION_TYPE2["SET_INSTALLED"] = "SET_INSTALLED";
  ENGINE_ACTION_TYPE2["SET_INSTALL_ID"] = "SET_INSTALL_ID";
  ENGINE_ACTION_TYPE2["SET_IS_EDITOR"] = "SET_EDITOR";
  ENGINE_ACTION_TYPE2["SET_CURRENT_EVENT"] = "SET_CURRENT_EVENT";
  ENGINE_ACTION_TYPE2["STOP"] = "STOP";
  ENGINE_ACTION_TYPE2["SHOW_RESET_NOTIFICATION"] = "SHOW_RESET_NOTIFICATION";
  ENGINE_ACTION_TYPE2["TOGGLE_DEVTOOLS_BLOCKED_CHOICES"] = "TOGGLE_DEVTOOLS_BLOCKED_CHOICES";
  ENGINE_ACTION_TYPE2["TOGGLE_DEVTOOLS_EXPRESSIONS"] = "TOGGLE_DEVTOOLS_EXPRESSIONS";
  ENGINE_ACTION_TYPE2["TOGGLE_DEVTOOLS_XRAY"] = "TOGGLE_DEVTOOLS_XRAY";
  ENGINE_ACTION_TYPE2["UPDATE_EVENT_IN_STREAM"] = "UPDATE_EVENT_IN_STREAM";
})(ENGINE_ACTION_TYPE || (ENGINE_ACTION_TYPE = {}));
const engineReducer = (state, action) => {
  switch (action.type) {
    case ENGINE_ACTION_TYPE.SET_INSTALLED:
      return __spreadProps(__spreadValues({}, state), {
        installed: action.installed
      });
    case ENGINE_ACTION_TYPE.SET_INSTALL_ID:
      return __spreadProps(__spreadValues({}, state), {
        installId: action.id
      });
    case ENGINE_ACTION_TYPE.SET_IS_EDITOR:
      return __spreadProps(__spreadValues({}, state), {
        isEditor: true
      });
    case ENGINE_ACTION_TYPE.SET_CURRENT_EVENT:
      return __spreadProps(__spreadValues({}, state), {
        currentEvent: action.id
      });
    case ENGINE_ACTION_TYPE.CLEAR_EVENT_STREAM:
      return __spreadProps(__spreadValues({}, state), {
        eventsInStream: []
      });
    case ENGINE_ACTION_TYPE.APPEND_EVENTS_TO_STREAM:
      if (!action.reset) {
        return __spreadProps(__spreadValues({}, state), {
          eventsInStream: [...action.events, ...state.eventsInStream]
        });
      } else {
        return __spreadProps(__spreadValues({}, state), {
          eventsInStream: action.events
        });
      }
    case ENGINE_ACTION_TYPE.UPDATE_EVENT_IN_STREAM:
      const foundEventIndex = state.eventsInStream.findIndex((event) => event.id === action.event.id);
      if (foundEventIndex !== -1) {
        const clonedEvents = lodash.exports.cloneDeep(state.eventsInStream);
        clonedEvents[foundEventIndex] = action.event;
        return __spreadProps(__spreadValues({}, state), {
          eventsInStream: clonedEvents
        });
      } else {
        return state;
      }
    case ENGINE_ACTION_TYPE.SET_GAME_INFO:
      return __spreadProps(__spreadValues({}, state), {
        gameInfo: action.gameInfo
      });
    case ENGINE_ACTION_TYPE.PLAY:
      return __spreadProps(__spreadValues({}, state), {
        currentEvent: action.fromEvent,
        playing: true
      });
    case ENGINE_ACTION_TYPE.STOP:
      return __spreadProps(__spreadValues({}, state), {
        eventsInStream: [],
        playing: false
      });
    case ENGINE_ACTION_TYPE.HIDE_RESET_NOTIFICATION:
      return __spreadProps(__spreadValues({}, state), {
        resetNotification: {
          message: void 0,
          showing: false
        }
      });
    case ENGINE_ACTION_TYPE.SHOW_RESET_NOTIFICATION:
      return __spreadProps(__spreadValues({}, state), {
        resetNotification: {
          message: action.message,
          showing: true
        }
      });
    case ENGINE_ACTION_TYPE.TOGGLE_DEVTOOLS_BLOCKED_CHOICES:
      return __spreadProps(__spreadValues({}, state), {
        devTools: __spreadProps(__spreadValues({}, state.devTools), {
          blockedChoicesVisible: !state.devTools.blockedChoicesVisible
        })
      });
    case ENGINE_ACTION_TYPE.TOGGLE_DEVTOOLS_EXPRESSIONS:
      return __spreadProps(__spreadValues({}, state), {
        devTools: __spreadProps(__spreadValues({}, state.devTools), {
          highlightExpressions: !state.devTools.highlightExpressions
        })
      });
    case ENGINE_ACTION_TYPE.TOGGLE_DEVTOOLS_XRAY:
      return __spreadProps(__spreadValues({}, state), {
        devTools: __spreadProps(__spreadValues({}, state.devTools), {
          xrayVisible: !state.devTools.xrayVisible
        })
      });
    default:
      return state;
  }
};
const defaultEngineState = {
  currentEvent: void 0,
  devTools: {
    blockedChoicesVisible: false,
    highlightExpressions: false,
    xrayVisible: false
  },
  eventsInStream: [],
  installed: false,
  installId: void 0,
  isEditor: false,
  gameInfo: void 0,
  playing: false,
  resetNotification: {
    message: void 0,
    showing: false
  }
};
const EngineContext = react.exports.createContext({
  engine: defaultEngineState,
  engineDispatch: () => null
});
EngineContext.displayName = "Context";
const EngineProvider = ({
  children
}) => {
  const [engine, engineDispatch] = react.exports.useReducer(engineReducer, defaultEngineState);
  return /* @__PURE__ */ jsx(EngineContext.Provider, {
    value: react.exports.useMemo(() => ({
      engine,
      engineDispatch
    }), [engine, engineDispatch]),
    children
  });
};
EngineProvider.displayName = "EngineProvider";
var SETTINGS_ACTION_TYPE;
(function(SETTINGS_ACTION_TYPE2) {
  SETTINGS_ACTION_TYPE2["CLOSE"] = "CLOSE";
  SETTINGS_ACTION_TYPE2["OPEN"] = "OPEN";
  SETTINGS_ACTION_TYPE2["SET_THEME"] = "SET_THEME";
})(SETTINGS_ACTION_TYPE || (SETTINGS_ACTION_TYPE = {}));
const settingsReducer = (state, action) => {
  switch (action.type) {
    case SETTINGS_ACTION_TYPE.CLOSE:
      return __spreadProps(__spreadValues({}, state), {
        open: false
      });
    case SETTINGS_ACTION_TYPE.OPEN:
      return __spreadProps(__spreadValues({}, state), {
        open: true
      });
    case SETTINGS_ACTION_TYPE.SET_THEME:
      return __spreadProps(__spreadValues({}, state), {
        theme: action.theme,
        open: action.closeSettings ? false : true
      });
    default:
      return state;
  }
};
const defaultSettingsState = {
  open: false,
  theme: void 0
};
const SettingsContext = react.exports.createContext({
  settings: defaultSettingsState,
  settingsDispatch: () => null
});
SettingsContext.displayName = "Context";
const SettingsProvider = ({
  children
}) => {
  const [settings, settingsDispatch] = react.exports.useReducer(settingsReducer, defaultSettingsState);
  return /* @__PURE__ */ jsx(SettingsContext.Provider, {
    value: react.exports.useMemo(() => ({
      settings,
      settingsDispatch
    }), [settings, settingsDispatch]),
    children
  });
};
SettingsProvider.displayName = "SettingsProvider";
const Installer = React.memo(({
  children,
  studioId,
  gameId,
  data,
  isEditor
}) => {
  const {
    engine,
    engineDispatch
  } = react.exports.useContext(EngineContext);
  useQuery([`installed-${engine.installId}`, engine.installed], async () => {
    try {
      if (!engine.installed) {
        if (!isEditor && data) {
          await saveEngineCollectionData(data);
        }
        if (isEditor) {
          engineDispatch({
            type: ENGINE_ACTION_TYPE.SET_IS_EDITOR
          });
          engineDispatch({
            type: ENGINE_ACTION_TYPE.HIDE_RESET_NOTIFICATION
          });
          await resetGame(studioId, gameId, true);
          await saveEngineDefaultGameCollectionData(studioId, gameId);
          engine.playing && engineDispatch({
            type: ENGINE_ACTION_TYPE.SET_CURRENT_EVENT,
            id: `${INITIAL_ENGINE_EVENT_ORIGIN_KEY}${gameId}`
          });
        }
        engineDispatch({
          type: ENGINE_ACTION_TYPE.SET_INSTALLED,
          installed: true
        });
        engineDispatch({
          type: ENGINE_ACTION_TYPE.SET_INSTALL_ID,
          id: v4()
        });
      }
      return true;
    } catch (error) {
      throw error;
    }
  }, {
    enabled: !engine.installed
  });
  react.exports.useEffect(() => {
    async function setGameData() {
      if (engine.installed) {
        const gameInfo = await getGameInfo(studioId, gameId);
        gameInfo && engineDispatch({
          type: ENGINE_ACTION_TYPE.SET_GAME_INFO,
          gameInfo: studioId ? __spreadValues({
            studioId
          }, lodash.exports.pick(gameInfo, ["designer", "id", "studioTitle", "title", "updated", "version"])) : lodash.exports.pick(gameInfo, ["designer", "id", "studioId", "studioTitle", "title", "updated", "version"])
        });
      }
    }
    setGameData();
  }, [engine.installed]);
  return /* @__PURE__ */ jsx(Fragment, {
    children: engine.installed && children
  });
});
Installer.displayName = "Installer";
const TitleCard = ({
  onStartGame,
  onContinueGame
}) => {
  const {
    settingsDispatch
  } = react.exports.useContext(SettingsContext), {
    engine
  } = react.exports.useContext(EngineContext);
  if (!engine.gameInfo)
    return null;
  const {
    studioId,
    id: gameId
  } = engine.gameInfo;
  const autoBookmark = useQuery("autoBookmark", async () => await getBookmarkAuto(studioId, gameId));
  return /* @__PURE__ */ jsx(Fragment, {
    children: engine.gameInfo && autoBookmark.data && /* @__PURE__ */ jsxs("div", {
      id: "title-card",
      children: [/* @__PURE__ */ jsxs("div", {
        id: "title-card-studio-title",
        children: [engine.gameInfo.studioTitle, " presents..."]
      }), /* @__PURE__ */ jsx("div", {
        id: "title-card-game-title",
        children: engine.gameInfo.title
      }), /* @__PURE__ */ jsxs("div", {
        id: "title-card-game-version",
        children: ["v", engine.gameInfo.version]
      }), /* @__PURE__ */ jsxs("div", {
        id: "title-card-game-designer",
        children: ["designed by ", engine.gameInfo.designer]
      }), /* @__PURE__ */ jsxs("div", {
        id: "title-card-btns",
        children: [/* @__PURE__ */ jsx("button", {
          id: "title-card-start-btn",
          onClick: !autoBookmark.data.event ? onStartGame : onContinueGame,
          children: !autoBookmark.data.event ? "START" : "CONTINUE"
        }), /* @__PURE__ */ jsx("button", {
          id: "title-card-settings-btn",
          onClick: () => settingsDispatch({
            type: SETTINGS_ACTION_TYPE.OPEN
          }),
          children: "SETTINGS"
        })]
      }), /* @__PURE__ */ jsxs("div", {
        id: "title-card-footer",
        children: ["powered by ", /* @__PURE__ */ jsx("a", {
          href: "http://elmstory.com",
          children: "Elm Story"
        })]
      })]
    })
  });
};
TitleCard.displayName = "TitleCard";
const EventStreamTitleBar = () => {
  const {
    engine,
    engineDispatch
  } = react.exports.useContext(EngineContext), {
    settingsDispatch
  } = react.exports.useContext(SettingsContext);
  return /* @__PURE__ */ jsx(Fragment, {
    children: engine.gameInfo && /* @__PURE__ */ jsxs("div", {
      id: "event-stream-title-bar",
      className: "title-bar",
      children: [/* @__PURE__ */ jsx("button", {
        onClick: () => engineDispatch({
          type: ENGINE_ACTION_TYPE.STOP
        }),
        children: /* @__PURE__ */ jsx("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          width: "16",
          height: "16",
          fill: "currentColor",
          viewBox: "0 0 16 16",
          children: /* @__PURE__ */ jsx("path", {
            fillRule: "evenodd",
            d: "M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
          })
        })
      }), /* @__PURE__ */ jsx("span", {
        id: "event-stream-title-bar-game-title",
        className: "title-bar-title",
        children: engine.gameInfo.title
      }), !engine.isEditor && /* @__PURE__ */ jsx("button", {
        onClick: () => settingsDispatch({
          type: SETTINGS_ACTION_TYPE.OPEN
        }),
        children: /* @__PURE__ */ jsx("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          width: "16",
          height: "16",
          fill: "currentColor",
          viewBox: "0 0 16 16",
          children: /* @__PURE__ */ jsx("path", {
            d: "M8.932.727c-.243-.97-1.62-.97-1.864 0l-.071.286a.96.96 0 0 1-1.622.434l-.205-.211c-.695-.719-1.888-.03-1.613.931l.08.284a.96.96 0 0 1-1.186 1.187l-.284-.081c-.96-.275-1.65.918-.931 1.613l.211.205a.96.96 0 0 1-.434 1.622l-.286.071c-.97.243-.97 1.62 0 1.864l.286.071a.96.96 0 0 1 .434 1.622l-.211.205c-.719.695-.03 1.888.931 1.613l.284-.08a.96.96 0 0 1 1.187 1.187l-.081.283c-.275.96.918 1.65 1.613.931l.205-.211a.96.96 0 0 1 1.622.434l.071.286c.243.97 1.62.97 1.864 0l.071-.286a.96.96 0 0 1 1.622-.434l.205.211c.695.719 1.888.03 1.613-.931l-.08-.284a.96.96 0 0 1 1.187-1.187l.283.081c.96.275 1.65-.918.931-1.613l-.211-.205a.96.96 0 0 1 .434-1.622l.286-.071c.97-.243.97-1.62 0-1.864l-.286-.071a.96.96 0 0 1-.434-1.622l.211-.205c.719-.695.03-1.888-.931-1.613l-.284.08a.96.96 0 0 1-1.187-1.186l.081-.284c.275-.96-.918-1.65-1.613-.931l-.205.211a.96.96 0 0 1-1.622-.434L8.932.727zM8 12.997a4.998 4.998 0 1 1 0-9.995 4.998 4.998 0 0 1 0 9.996z"
          })
        })
      })]
    })
  });
};
EventStreamTitleBar.displayName = "EventStreamTitleBar";
const ENGINE_XRAY_CONTAINER_HEIGHT = 250;
const EventPassageXRay = React.memo(({
  event
}) => {
  const {
    engine
  } = react.exports.useContext(EngineContext);
  if (!engine.gameInfo)
    return null;
  const {
    studioId,
    id: gameId
  } = engine.gameInfo;
  const variables = dexieReactHooks.exports.useLiveQuery(() => new LibraryDatabase(studioId).variables.where({
    gameId
  }).toArray(), [], []);
  const gotoPassage = () => {
    window.dispatchEvent(new CustomEvent(ENGINE_DEVTOOLS_EVENTS.ENGINE_TO_EDITOR, {
      detail: {
        eventType: ENGINE_DEVTOOLS_EVENT_TYPE.OPEN_PASSAGE,
        passageId: event.destination
      }
    }));
  };
  return /* @__PURE__ */ jsxs("div", {
    id: "engine-xray",
    children: [/* @__PURE__ */ jsxs("table", {
      className: "event-data",
      children: [/* @__PURE__ */ jsx("thead", {
        children: /* @__PURE__ */ jsx("tr", {
          children: /* @__PURE__ */ jsx("th", {
            colSpan: 2,
            children: "Current Event | XRAY"
          })
        })
      }), /* @__PURE__ */ jsxs("tbody", {
        children: [/* @__PURE__ */ jsxs("tr", {
          children: [/* @__PURE__ */ jsx("td", {
            children: "ID"
          }), /* @__PURE__ */ jsx("td", {
            children: event.id
          })]
        }), /* @__PURE__ */ jsxs("tr", {
          children: [/* @__PURE__ */ jsx("td", {
            children: "Type"
          }), /* @__PURE__ */ jsx("td", {
            children: event.type
          })]
        }), /* @__PURE__ */ jsxs("tr", {
          children: [/* @__PURE__ */ jsx("td", {
            children: "Passage"
          }), /* @__PURE__ */ jsx("td", {
            children: /* @__PURE__ */ jsx("a", {
              title: "Goto Passage",
              onClick: gotoPassage,
              children: event.destination
            })
          })]
        })]
      })]
    }), variables.length > 0 && /* @__PURE__ */ jsxs("table", {
      id: "engine-xray-variables",
      children: [/* @__PURE__ */ jsx("thead", {
        children: /* @__PURE__ */ jsxs("tr", {
          children: [/* @__PURE__ */ jsx("th", {
            children: "Variable Title"
          }), /* @__PURE__ */ jsx("th", {
            children: "ID"
          }), /* @__PURE__ */ jsx("th", {
            children: "Type"
          }), /* @__PURE__ */ jsx("th", {
            children: "Initial Value"
          }), /* @__PURE__ */ jsx("th", {
            children: "Current Value"
          })]
        })
      }), /* @__PURE__ */ jsx("tbody", {
        children: event && variables.length > 0 && variables.map((variable) => {
          var _a;
          const {
            id,
            title,
            type,
            initialValue
          } = variable;
          return /* @__PURE__ */ jsx(Fragment, {
            children: /* @__PURE__ */ jsxs("tr", {
              children: [/* @__PURE__ */ jsx("td", {
                children: title
              }), /* @__PURE__ */ jsx("td", {
                children: id
              }), /* @__PURE__ */ jsx("td", {
                children: type
              }), /* @__PURE__ */ jsx("td", {
                children: initialValue || "undefined"
              }), /* @__PURE__ */ jsx("td", {
                children: ((_a = event.state[id]) == null ? void 0 : _a.value) || "undefined"
              })]
            }, `event-state-variable-${id}`)
          });
        })
      })]
    })]
  });
});
EventPassageXRay.displayName = "EventPassageXRay";
var NODE_TYPES;
(function(NODE_TYPES2) {
  NODE_TYPES2["EXPRESSION_ERROR"] = "ExpressionError";
  NODE_TYPES2["EXPRESSION_STATEMENT"] = "ExpressionStatement";
  NODE_TYPES2["IDENTIFIER"] = "Identifier";
  NODE_TYPES2["LITERAL"] = "Literal";
  NODE_TYPES2["CALL_EXPRESSION"] = "CallExpression";
  NODE_TYPES2["CONDITIONAL_EXPRESSION"] = "ConditionalExpression";
  NODE_TYPES2["BINARY_EXPRESSION"] = "BinaryExpression";
  NODE_TYPES2["MEMBER_EXPRESSION"] = "MemberExpression";
  NODE_TYPES2["UNARY_EXPRESSION"] = "UnaryExpression";
})(NODE_TYPES || (NODE_TYPES = {}));
function getTemplateExpressions(template) {
  const templateExpressions = template.match(/{([^}]+)}/g);
  return templateExpressions ? templateExpressions.map((templateExpression) => templateExpression.replace(/{|}/g, "")) : [];
}
function processIdentifierExpression(expression, variables) {
  if (expression.type === NODE_TYPES.IDENTIFIER && expression.name) {
    return variables[expression == null ? void 0 : expression.name] ? {
      type: NODE_TYPES.IDENTIFIER,
      variableName: expression.name
    } : {
      type: NODE_TYPES.EXPRESSION_ERROR,
      message: `Unable to process identifier expression. '${expression.name}' is an unknown variable.`
    };
  } else {
    return {
      type: NODE_TYPES.EXPRESSION_ERROR,
      message: "Unable to process identifier expression."
    };
  }
}
function processCallExpression(expression, gameVariables, gameMethods2) {
  const callee = expression.callee;
  if (callee && callee.type === NODE_TYPES.MEMBER_EXPRESSION && callee.object && callee.object.type === NODE_TYPES.IDENTIFIER && callee.object.name && callee.property && callee.property.type === NODE_TYPES.IDENTIFIER && callee.property.name) {
    if (gameVariables[callee.object.name] && gameMethods2[callee.property.name]) {
      return {
        type: NODE_TYPES.CALL_EXPRESSION,
        variableName: callee.object.name,
        methodName: callee.property.name
      };
    } else {
      return {
        type: NODE_TYPES.EXPRESSION_ERROR,
        message: `Unable to process call expression. ${!gameVariables[callee.object.name] ? `Missing game variable: '${callee.object.name}' ` : ""}${!gameMethods2[callee.property.name] ? `Missing game method: '${callee.property.name}` : ""}`
      };
    }
  } else {
    return {
      type: NODE_TYPES.EXPRESSION_ERROR,
      message: `Unable to process call expression. Example format: '{ variableName.upper() }`
    };
  }
}
function processConditionalExpression(expression) {
  var _a, _b;
  const test = expression.test, consequent = expression.consequent, alternate = expression.alternate;
  if (test && consequent && (consequent.type === NODE_TYPES.IDENTIFIER || consequent.type === NODE_TYPES.LITERAL) && (consequent.name !== void 0 || consequent.value !== void 0) && alternate && (alternate.type === NODE_TYPES.IDENTIFIER || alternate.type === NODE_TYPES.LITERAL) && (alternate.name !== void 0 || alternate.value !== void 0)) {
    if (test.type === NODE_TYPES.UNARY_EXPRESSION && ((_a = test.argument) == null ? void 0 : _a.type) === NODE_TYPES.IDENTIFIER && ((_b = test.argument) == null ? void 0 : _b.name) && test.operator === "!") {
      return {
        type: NODE_TYPES.CONDITIONAL_EXPRESSION,
        argument: {
          name: test.argument.name,
          type: test.argument.type
        },
        consequent: {
          type: consequent.type,
          variableName: consequent.type === NODE_TYPES.IDENTIFIER ? consequent.name : void 0,
          value: consequent.type === NODE_TYPES.LITERAL ? consequent.value : void 0
        },
        alternate: {
          type: alternate.type,
          variableName: alternate.type === NODE_TYPES.IDENTIFIER ? alternate.name : void 0,
          value: alternate.type === NODE_TYPES.LITERAL ? alternate.value : void 0
        }
      };
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
          variableName: consequent.type === NODE_TYPES.IDENTIFIER ? consequent.name : void 0,
          value: consequent.type === NODE_TYPES.LITERAL ? consequent.value : void 0
        },
        alternate: {
          type: alternate.type,
          variableName: alternate.type === NODE_TYPES.IDENTIFIER ? alternate.name : void 0,
          value: alternate.type === NODE_TYPES.LITERAL ? alternate.value : void 0
        }
      };
    }
    if (test.type === NODE_TYPES.BINARY_EXPRESSION && test.left && (test.left.type === NODE_TYPES.IDENTIFIER || test.left.type === NODE_TYPES.LITERAL) && test.operator && test.right && (test.right.type === NODE_TYPES.IDENTIFIER || test.right.type === NODE_TYPES.LITERAL)) {
      return {
        type: NODE_TYPES.CONDITIONAL_EXPRESSION,
        left: {
          type: test.left.type,
          variableName: test.left.type === NODE_TYPES.IDENTIFIER ? test.left.name : void 0,
          value: test.left.type === NODE_TYPES.LITERAL ? test.left.value : void 0
        },
        right: {
          type: test.right.type,
          variableName: test.right.type === NODE_TYPES.IDENTIFIER ? test.right.name : void 0,
          value: test.right.type === NODE_TYPES.LITERAL ? test.right.value : void 0
        },
        operator: test.operator,
        consequent: {
          type: consequent.type,
          variableName: consequent.type === NODE_TYPES.IDENTIFIER ? consequent.name : void 0,
          value: consequent.type === NODE_TYPES.LITERAL ? consequent.value : void 0
        },
        alternate: {
          type: alternate.type,
          variableName: alternate.type === NODE_TYPES.IDENTIFIER ? alternate.name : void 0,
          value: alternate.type === NODE_TYPES.LITERAL ? alternate.value : void 0
        }
      };
    }
    return {
      type: NODE_TYPES.EXPRESSION_ERROR,
      message: `Unable to process conditional expression. Example format: '{ variableName > 0 ? "Greater than 0." : "Not greater than zero." }`
    };
  } else {
    return {
      type: NODE_TYPES.EXPRESSION_ERROR,
      message: `Unable to process conditional expression. Example format: '{ variableName > 0 ? "Greater than 0." : "Not greater than zero." }`
    };
  }
}
function parseTemplateExpressions(templateExpressions, variables, methods) {
  const parsedExpressions = [];
  templateExpressions.map((templateExpression) => {
    try {
      const parsedExpression = parse(templateExpression, {
        ecmaVersion: 2020
      }), statement = parsedExpression.body && parsedExpression.body[0], expression = statement == null ? void 0 : statement.expression;
      if (statement && statement.type === NODE_TYPES.EXPRESSION_STATEMENT && expression) {
        switch (expression.type) {
          case NODE_TYPES.IDENTIFIER:
            parsedExpressions.push(processIdentifierExpression(expression, variables));
            break;
          case NODE_TYPES.CALL_EXPRESSION:
            parsedExpressions.push(processCallExpression(expression, variables, methods));
            break;
          case NODE_TYPES.CONDITIONAL_EXPRESSION:
            parsedExpressions.push(processConditionalExpression(expression));
            break;
          case NODE_TYPES.BINARY_EXPRESSION:
            parsedExpressions.push({
              type: NODE_TYPES.EXPRESSION_ERROR,
              message: `Unable to parse template expression. '${templateExpression}' is not supported, but is planned for a future release.`
            });
            break;
          default:
            parsedExpressions.push({
              type: NODE_TYPES.EXPRESSION_ERROR,
              message: `Unable to parse template expression. '${templateExpression}' is not supported.`
            });
            break;
        }
      } else {
        parsedExpressions.push({
          type: NODE_TYPES.EXPRESSION_ERROR,
          message: `Unable to parse template expression. '${templateExpression}' is not supported.`
        });
      }
    } catch (error) {
      parsedExpressions.push({
        type: NODE_TYPES.EXPRESSION_ERROR,
        message: `Unable to parse template expression. '${templateExpression}' is not supported.`
      });
    }
  });
  return parsedExpressions;
}
function getProcessedTemplate(template, expressions, parsedExpressions, variables, methods) {
  let processedTemplate = `${template}`;
  expressions.map((expression, index) => {
    var _a, _b;
    const parsedExpression = parsedExpressions[index];
    let value;
    switch (parsedExpression.type) {
      case NODE_TYPES.IDENTIFIER:
        value = variables[parsedExpression.variableName].value || "undefined";
        break;
      case NODE_TYPES.CALL_EXPRESSION:
        value = (_a = methods[parsedExpression.methodName]) == null ? void 0 : _a.call(methods, variables[parsedExpression.variableName].value);
        break;
      case NODE_TYPES.CONDITIONAL_EXPRESSION:
        const leftVariable = parsedExpression.left, rightVariable = parsedExpression.right;
        const operator = parsedExpression.operator;
        const consequent = parsedExpression.consequent, alternate = parsedExpression.alternate;
        const consequentValue = consequent && consequent.variableName && consequent.type === NODE_TYPES.IDENTIFIER ? variables[consequent.variableName] ? variables[consequent.variableName].value || "undefined" : "esg-error" : consequent.value, alternateValue = alternate && alternate.variableName && alternate.type === NODE_TYPES.IDENTIFIER ? variables[alternate.variableName] ? variables[alternate.variableName].value || "undefined" : "esg-error" : alternate.value;
        const foundLeftVariable = (leftVariable == null ? void 0 : leftVariable.variableName) ? variables[leftVariable.variableName] : void 0, foundRightVariable = (rightVariable == null ? void 0 : rightVariable.variableName) ? variables[rightVariable.variableName] : void 0;
        switch (operator) {
          case ">":
          case ">=":
          case "<":
          case "<=":
            if ((leftVariable == null ? void 0 : leftVariable.variableName) && (rightVariable == null ? void 0 : rightVariable.variableName)) {
              if (foundLeftVariable && foundLeftVariable.type === VARIABLE_TYPE.NUMBER && foundLeftVariable.value && foundRightVariable && foundRightVariable.type === VARIABLE_TYPE.NUMBER && foundRightVariable.value) {
                switch (operator) {
                  case ">":
                    value = Number(foundLeftVariable.value) > Number(foundRightVariable.value) ? consequentValue : alternateValue;
                    break;
                  case ">=":
                    value = Number(foundLeftVariable.value) >= Number(foundRightVariable.value) ? consequentValue : alternateValue;
                    break;
                  case "<":
                    value = Number(foundLeftVariable.value) < Number(foundRightVariable.value) ? consequentValue : alternateValue;
                    break;
                  case "<=":
                    value = Number(foundLeftVariable.value) <= Number(foundRightVariable.value) ? consequentValue : alternateValue;
                    break;
                  default:
                    value = "esg-error";
                }
              } else {
                value = "esg-error";
              }
            }
            if ((leftVariable == null ? void 0 : leftVariable.variableName) && rightVariable && !rightVariable.variableName || (rightVariable == null ? void 0 : rightVariable.variableName) && leftVariable && !leftVariable.variableName) {
              if (foundLeftVariable && foundLeftVariable.type === VARIABLE_TYPE.NUMBER && foundLeftVariable.value && (rightVariable.value || rightVariable.value === 0) && typeof rightVariable.value === "number" || foundRightVariable && foundRightVariable.type === VARIABLE_TYPE.NUMBER && foundRightVariable.value && (leftVariable.value || leftVariable.value === 0) && typeof leftVariable.value === "number") {
                switch (operator) {
                  case ">":
                    value = Number((foundLeftVariable == null ? void 0 : foundLeftVariable.value) || leftVariable.value) > Number((foundRightVariable == null ? void 0 : foundRightVariable.value) || rightVariable.value) ? consequentValue : alternateValue;
                    break;
                  case ">=":
                    value = Number((foundLeftVariable == null ? void 0 : foundLeftVariable.value) || leftVariable.value) >= Number((foundRightVariable == null ? void 0 : foundRightVariable.value) || rightVariable.value) ? consequentValue : alternateValue;
                    break;
                  case "<":
                    value = Number((foundLeftVariable == null ? void 0 : foundLeftVariable.value) || leftVariable.value) < Number((foundRightVariable == null ? void 0 : foundRightVariable.value) || rightVariable.value) ? consequentValue : alternateValue;
                    break;
                  case "<=":
                    value = Number((foundLeftVariable == null ? void 0 : foundLeftVariable.value) || leftVariable.value) <= Number((foundRightVariable == null ? void 0 : foundRightVariable.value) || rightVariable.value) ? consequentValue : alternateValue;
                    break;
                  default:
                    value = "esg-error";
                }
              } else {
                value = "esg-error";
              }
            }
            if (!value)
              value = "esg-error";
            break;
          case "==":
          case "!=":
            if (foundLeftVariable && foundRightVariable) {
              if (foundLeftVariable.type === VARIABLE_TYPE.BOOLEAN && foundRightVariable.type === VARIABLE_TYPE.BOOLEAN) {
                value = operator === "==" ? foundLeftVariable.value === "true" && foundRightVariable.value === "true" || foundLeftVariable.value === "false" && foundRightVariable.value === "false" ? consequentValue : alternateValue : foundLeftVariable.value === "true" && foundRightVariable.value === "false" || foundLeftVariable.value === "false" && foundRightVariable.value === "true" ? consequentValue : alternateValue;
              }
              if (!value && foundLeftVariable.value && foundRightVariable.value) {
                value = operator === "==" ? foundLeftVariable.value === foundRightVariable.value ? consequentValue : alternateValue : foundLeftVariable.value !== foundRightVariable.value ? consequentValue : alternateValue;
              }
            }
            if (foundLeftVariable && !foundRightVariable) {
              if (foundLeftVariable.type === VARIABLE_TYPE.BOOLEAN && typeof (rightVariable == null ? void 0 : rightVariable.value) === "boolean") {
                value = operator === "==" ? foundLeftVariable.value === "true" && rightVariable.value || foundLeftVariable.value === "false" && !rightVariable.value ? consequentValue : alternateValue : foundLeftVariable.value === "false" && rightVariable.value || foundLeftVariable.value === "true" && !rightVariable.value ? consequentValue : alternateValue;
              }
              if (foundLeftVariable.type === VARIABLE_TYPE.NUMBER && typeof (rightVariable == null ? void 0 : rightVariable.value) === "number") {
                value = operator === "==" ? Number(foundLeftVariable.value) === rightVariable.value ? consequentValue : alternateValue : Number(foundLeftVariable.value) !== rightVariable.value ? consequentValue : alternateValue;
              }
              if (!value && foundLeftVariable.value && (rightVariable == null ? void 0 : rightVariable.value)) {
                value = operator === "==" ? foundLeftVariable.value === (rightVariable == null ? void 0 : rightVariable.value) ? consequentValue : alternateValue : foundLeftVariable.value !== (rightVariable == null ? void 0 : rightVariable.value) ? consequentValue : alternateValue;
              }
            }
            if (!foundLeftVariable && foundRightVariable) {
              if (foundRightVariable.type === VARIABLE_TYPE.BOOLEAN && typeof (leftVariable == null ? void 0 : leftVariable.value) === "boolean") {
                value = operator === "==" ? foundRightVariable.value === "true" && leftVariable.value || foundRightVariable.value === "false" && !leftVariable.value ? consequentValue : alternateValue : foundRightVariable.value === "false" && leftVariable.value || foundRightVariable.value === "true" && !leftVariable.value ? consequentValue : alternateValue;
              }
              if (foundRightVariable.type === VARIABLE_TYPE.NUMBER && typeof (leftVariable == null ? void 0 : leftVariable.value) === "number") {
                value = operator === "==" ? Number(foundRightVariable.value) === leftVariable.value ? consequentValue : alternateValue : Number(foundRightVariable.value) !== leftVariable.value ? consequentValue : alternateValue;
              }
              if (!value && foundRightVariable.value && (leftVariable == null ? void 0 : leftVariable.value)) {
                value = operator === "==" ? foundRightVariable.value === (leftVariable == null ? void 0 : leftVariable.value) ? consequentValue : alternateValue : foundRightVariable.value !== (leftVariable == null ? void 0 : leftVariable.value) ? consequentValue : alternateValue;
              }
            }
            if (!value)
              value = "esg-error";
            break;
          default:
            value = "esg-error";
            break;
        }
        if ((_b = parsedExpression.identifier) == null ? void 0 : _b.variableName) {
          const foundVariable = variables[parsedExpression.identifier.variableName];
          if (foundVariable) {
            if (foundVariable.type === VARIABLE_TYPE.BOOLEAN) {
              value = foundVariable.value === "true" ? consequentValue : alternateValue;
            }
            if (foundVariable.type !== VARIABLE_TYPE.BOOLEAN) {
              value = foundVariable && foundVariable.value ? consequentValue : alternateValue;
            }
          }
          if (!foundVariable)
            value = "esg-error";
        }
        if (parsedExpression.argument && parsedExpression.argument.name && parsedExpression.argument.type) {
          const foundVariable = variables[parsedExpression.argument.name];
          if (foundVariable) {
            value = foundVariable.type === VARIABLE_TYPE.BOOLEAN ? foundVariable.value === "false" ? consequentValue : alternateValue : alternateValue;
          }
          if (!foundVariable)
            value = "esg-error";
        }
        break;
      case NODE_TYPES.EXPRESSION_ERROR:
        value = "esg-error";
        break;
    }
    value = value ? `{${value}}` : "";
    processedTemplate = processedTemplate.split("{" + expression + "}").join(value || "");
  });
  return processedTemplate.replace(/\s+/g, " ").trim();
}
const gameMethods = {
  lower: (value) => value.toLowerCase(),
  upper: (value) => value.toUpperCase()
};
const processTemplateBlock = (template, state) => {
  const expressions = getTemplateExpressions(template), variables = {};
  Object.entries(state).map((variable) => {
    const data = variable[1];
    variables[data.title] = {
      value: data.value,
      type: data.type
    };
  });
  const parsedExpressions = parseTemplateExpressions(expressions, variables, gameMethods);
  return [getProcessedTemplate(template, expressions, parsedExpressions, variables, gameMethods), expressions];
};
const decorate = (template, state, highlightExpressions) => {
  const [processedTemplate, expressions] = processTemplateBlock(template, state);
  let matchExpressionCounter = 0;
  return reactStringReplace(processedTemplate, /{([^}]+)}/g, (match) => {
    const matchedExpression = expressions[matchExpressionCounter];
    matchExpressionCounter++;
    return highlightExpressions ? /* @__PURE__ */ jsx("span", {
      className: match === "esg-error" ? `expression-error` : `expression`,
      title: matchedExpression,
      children: match === "esg-error" ? "ERROR" : match
    }, `expression-${matchExpressionCounter}`) : match === "esg-error" ? /* @__PURE__ */ jsx("span", {
      className: "expression-error",
      title: matchedExpression,
      children: "ERROR"
    }, `expression-${matchExpressionCounter}`) : /* @__PURE__ */ jsx("span", {
      children: match
    }, `span-${matchExpressionCounter}`);
  });
};
const EventPassageContent = React.memo(({
  content,
  state
}) => {
  const {
    engine
  } = react.exports.useContext(EngineContext);
  const parsedContent = JSON.parse(content);
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [parsedContent.map((descendant, index) => {
      return /* @__PURE__ */ jsx("p", {
        children: decorate(descendant.children[0].text, state, engine.devTools.highlightExpressions)
      }, `content-p-text-${index}`);
    }), !parsedContent[0].children[0].text && parsedContent.length === 1 && /* @__PURE__ */ jsx("div", {
      className: "engine-warning-message",
      children: "Passage content required."
    })]
  });
});
EventPassageContent.displayName = "EventPassageContent";
const EventLoopbackButtonContent = /* @__PURE__ */ jsxs(Fragment, {
  children: [/* @__PURE__ */ jsx("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    xmlns: "http://www.w3.org/2000/svg",
    className: "event-loopback-btn-content",
    children: /* @__PURE__ */ jsx("path", {
      d: "M14.854 4.854C14.9006 4.80755 14.9375 4.75238 14.9627 4.69163C14.9879 4.63089 15.0009 4.56577 15.0009 4.5C15.0009 4.43423 14.9879 4.36911 14.9627 4.30836C14.9375 4.24762 14.9006 4.19244 14.854 4.146L10.854 0.145998C10.7601 0.0521117 10.6328 -0.00063324 10.5 -0.00063324C10.3672 -0.00063324 10.2399 0.0521117 10.146 0.145998C10.0521 0.239885 9.99937 0.367223 9.99937 0.499998C9.99937 0.632774 10.0521 0.760112 10.146 0.853998L13.293 4H3.5C2.83696 4 2.20107 4.26339 1.73223 4.73223C1.26339 5.20107 1 5.83696 1 6.5L1 10.5C1 11.163 1.26339 11.7989 1.73223 12.2678C2.20107 12.7366 2.83696 13 3.5 13H10.5C10.6326 13 10.7598 12.9473 10.8536 12.8536C10.9473 12.7598 11 12.6326 11 12.5C11 12.3674 10.9473 12.2402 10.8536 12.1464C10.7598 12.0527 10.6326 12 10.5 12H3.5C3.10218 12 2.72064 11.842 2.43934 11.5607C2.15804 11.2794 2 10.8978 2 10.5L2 6.5C2 6.10217 2.15804 5.72064 2.43934 5.43934C2.72064 5.15803 3.10218 5 3.5 5H13.293L10.146 8.146C10.0521 8.23988 9.99937 8.36722 9.99937 8.5C9.99937 8.63277 10.0521 8.76011 10.146 8.854C10.2399 8.94788 10.3672 9.00063 10.5 9.00063C10.6328 9.00063 10.7601 8.94788 10.854 8.854L14.854 4.854Z",
      fillRule: "evenodd"
    })
  }), "RETURN"]
});
const EventLoopbackButton = React.memo(({
  onClick,
  eventResult
}) => {
  return /* @__PURE__ */ jsx("div", {
    className: `event-loopback-btn ${(eventResult == null ? void 0 : eventResult.value) === ENGINE_EVENT_LOOPBACK_RESULT_VALUE ? "event-choice-result" : ""}`,
    children: /* @__PURE__ */ jsx("button", {
      onClick,
      type: !onClick ? "submit" : void 0,
      disabled: (eventResult == null ? void 0 : eventResult.value) === ENGINE_EVENT_LOOPBACK_RESULT_VALUE ? true : false,
      children: EventLoopbackButtonContent
    })
  });
});
EventLoopbackButton.displayName = "EventLoopbackButton";
const EventPassagePassthroughChoice = React.memo(({
  routes,
  event,
  onSubmitRoute,
  originId
}) => {
  var _a, _b;
  const {
    engine
  } = react.exports.useContext(EngineContext);
  if (!engine.gameInfo)
    return null;
  const {
    studioId,
    id: gameId
  } = engine.gameInfo;
  const conditions = dexieReactHooks.exports.useLiveQuery(() => new LibraryDatabase(studioId).conditions.where({
    gameId
  }).toArray(), []);
  const variables = dexieReactHooks.exports.useLiveQuery(() => new LibraryDatabase(studioId).variables.where({
    gameId
  }).toArray(), []);
  const {
    data: openRoute,
    isLoading: openRouteIsLoading
  } = useQuery([`passthrough-${event.id}`, routes, conditions, variables], async () => {
    return await findOpenRoute(studioId, routes, event.state);
  });
  const submitChoice = react.exports.useCallback(async () => openRoute && !openRouteIsLoading && await onSubmitRoute({
    originId,
    route: openRoute,
    result: {
      value: ENGINE_EVENT_PASSTHROUGH_RESULT_VALUE
    }
  }), [openRoute]);
  return /* @__PURE__ */ jsx("div", {
    className: `event-choice ${((_a = event.result) == null ? void 0 : _a.value) === ENGINE_EVENT_PASSTHROUGH_RESULT_VALUE ? "event-choice-result" : ""}`,
    children: /* @__PURE__ */ jsx(Fragment, {
      children: /* @__PURE__ */ jsx("button", {
        onClick: submitChoice,
        disabled: event.result || !openRoute && !openRouteIsLoading ? true : false,
        className: !event.result && !openRoute && !openRouteIsLoading ? "closed-route" : "",
        children: ((_b = event.result) == null ? void 0 : _b.value) === ENGINE_EVENT_PASSTHROUGH_RESULT_VALUE ? "Continue" : engine.currentEvent === event.id && !openRoute && !openRouteIsLoading ? "Route Required" : "Continue"
      })
    })
  });
});
EventPassagePassthroughChoice.displayName = "EventPassagePassthroughChoice";
const EventPassageChoice = React.memo(({
  data,
  eventResult,
  onSubmitRoute,
  openRoute,
  originId
}) => {
  const submitChoice = react.exports.useCallback(async () => openRoute && await onSubmitRoute({
    originId,
    route: openRoute,
    result: {
      id: data.id,
      value: data.title
    }
  }), [openRoute]);
  return /* @__PURE__ */ jsx(Fragment, {
    children: (!eventResult || openRoute) && /* @__PURE__ */ jsx("div", {
      className: `event-choice ${(eventResult == null ? void 0 : eventResult.id) === data.id ? "event-choice-result" : ""}`,
      children: /* @__PURE__ */ jsx("button", {
        onClick: submitChoice,
        disabled: eventResult || !openRoute ? true : false,
        className: !openRoute ? "closed-route" : "",
        children: data.title
      })
    })
  });
});
EventPassageChoice.displayName = "EventPassageChoice";
const EventPassageChoices = React.memo(({
  passage,
  event,
  onSubmitRoute
}) => {
  var _a, _b;
  const eventChoicesRef = react.exports.useRef(null);
  const {
    engine,
    engineDispatch
  } = react.exports.useContext(EngineContext);
  if (!engine.gameInfo)
    return null;
  const {
    studioId,
    id: gameId
  } = engine.gameInfo;
  const choices = dexieReactHooks.exports.useLiveQuery(async () => {
    const foundChoices = await new LibraryDatabase(studioId).choices.where({
      passageId: passage.id
    }).toArray();
    try {
      if (foundChoices) {
        const {
          filteredChoices,
          openRoutes
        } = await Promise.resolve(getChoicesFromPassageWithOpenRoute(studioId, foundChoices, event.state, engine.devTools.blockedChoicesVisible ? true : false));
        return filteredChoices.sort((a, b) => passage.choices.findIndex((choiceId) => a.id === choiceId) - passage.choices.findIndex((choiceId) => b.id === choiceId)).map((filteredChoice) => {
          return {
            data: filteredChoice,
            openRoute: openRoutes[filteredChoice.id]
          };
        });
      }
      return [];
    } catch (error) {
      throw error;
    }
  }, [passage, event, engine.devTools.blockedChoicesVisible]);
  const routePassthroughs = dexieReactHooks.exports.useLiveQuery(async () => {
    const foundRoutes = await new LibraryDatabase(studioId).routes.where({
      originId: passage.id
    }).toArray();
    return foundRoutes.filter((foundRoute) => foundRoute.choiceId === void 0);
  }, [passage, event, engine.devTools.blockedChoicesVisible]);
  const loopback = react.exports.useCallback(async () => {
    if (event.prev && event.origin) {
      await onSubmitRoute({
        originId: event.origin,
        result: {
          value: ENGINE_EVENT_LOOPBACK_RESULT_VALUE
        }
      });
    } else {
      engineDispatch({
        type: ENGINE_ACTION_TYPE.SHOW_RESET_NOTIFICATION,
        message: "Unable to return. Missing route."
      });
    }
  }, [event]);
  const restartGame = react.exports.useCallback(async () => {
    onSubmitRoute({
      result: {
        value: ENGINE_EVENT_GAME_OVER_RESULT_VALUE
      }
    });
  }, [event]);
  return /* @__PURE__ */ jsxs("div", {
    className: "event-choices",
    ref: eventChoicesRef,
    children: [!passage.gameOver && choices && routePassthroughs && /* @__PURE__ */ jsxs(Fragment, {
      children: [routePassthroughs.length > 0 && /* @__PURE__ */ jsx(Fragment, {
        children: /* @__PURE__ */ jsx(EventPassagePassthroughChoice, {
          routes: routePassthroughs,
          event,
          onSubmitRoute,
          originId: event.origin
        })
      }), routePassthroughs.length === 0 && /* @__PURE__ */ jsx(Fragment, {
        children: choices.map(({
          data,
          openRoute
        }) => /* @__PURE__ */ jsx(EventPassageChoice, {
          data,
          eventResult: event.result,
          onSubmitRoute,
          openRoute,
          originId: event.origin
        }, data.id))
      }), choices.length === 0 && routePassthroughs.length === 0 && /* @__PURE__ */ jsx("div", {
        className: "event-choice",
        children: /* @__PURE__ */ jsxs(Fragment, {
          children: [engine.currentEvent !== `${INITIAL_ENGINE_EVENT_ORIGIN_KEY}${gameId}` && /* @__PURE__ */ jsxs(Fragment, {
            children: [(!event.result || event.result.value === ENGINE_EVENT_LOOPBACK_RESULT_VALUE) && /* @__PURE__ */ jsx(EventLoopbackButton, {
              onClick: loopback,
              eventResult: event.result
            }), ((_a = event.result) == null ? void 0 : _a.value) === ENGINE_EVENT_PASSTHROUGH_RESULT_VALUE && /* @__PURE__ */ jsx(EventPassagePassthroughChoice, {
              routes: routePassthroughs,
              event,
              onSubmitRoute,
              originId: event.origin
            })]
          }), engine.currentEvent === `${INITIAL_ENGINE_EVENT_ORIGIN_KEY}${gameId}` && /* @__PURE__ */ jsx("button", {
            disabled: true,
            className: "closed-route",
            children: "Route Required"
          })]
        })
      }), !choices && passage.choices.map((choiceId) => /* @__PURE__ */ jsx("div", {
        className: "event-choice",
        children: /* @__PURE__ */ jsx("button", {
          style: {
            opacity: 0
          },
          children: "-"
        })
      }, choiceId))]
    }), passage.gameOver && /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsx("div", {
        className: "event-choice",
        children: /* @__PURE__ */ jsx("button", {
          onClick: restartGame,
          disabled: event.result ? true : false,
          children: translateEventResultValue(((_b = event.result) == null ? void 0 : _b.value) || "New Game")
        })
      }), !engine.isEditor && /* @__PURE__ */ jsx("div", {
        className: "event-choice",
        children: /* @__PURE__ */ jsx("button", {
          onClick: () => engineDispatch({
            type: ENGINE_ACTION_TYPE.STOP
          }),
          children: "Title Screen"
        })
      })]
    })]
  });
});
EventPassageChoices.displayName = "EventPassageChoices";
const EventPassageInput = React.memo(({
  passage,
  event,
  onSubmitRoute
}) => {
  const {
    engine
  } = react.exports.useContext(EngineContext);
  if (!engine.gameInfo)
    return null;
  const {
    studioId
  } = engine.gameInfo;
  const inputRef = react.exports.useRef(null);
  const [inputValue, setInputValue] = react.exports.useState(""), [routeError, setRouteError] = react.exports.useState(false);
  const input = dexieReactHooks.exports.useLiveQuery(() => new LibraryDatabase(studioId).inputs.where({
    passageId: passage.id
  }).first());
  const inputVariable = dexieReactHooks.exports.useLiveQuery(async () => {
    let variable;
    if (input == null ? void 0 : input.variableId) {
      variable = await new LibraryDatabase(studioId).variables.get(input.variableId);
      if (variable) {
        let value = event.state[variable.id].value;
        switch (event.state[variable.id].type) {
          case VARIABLE_TYPE.NUMBER:
            value = Number(value);
            break;
          default:
            value = void 0;
            break;
        }
        setInputValue(value || (variable == null ? void 0 : variable.initialValue));
      }
    }
    return variable;
  }, [input]);
  const submitInput = react.exports.useCallback(async (boolValue) => {
    if (input && inputVariable && inputValue) {
      const stateWithInputValue = lodash.exports.cloneDeep(event.state);
      stateWithInputValue[inputVariable.id].value = boolValue || `${inputValue}`;
      const foundOpenRoute = await findOpenRoute(studioId, await getRoutesFromInput(studioId, input.id), stateWithInputValue);
      if (foundOpenRoute || event.origin) {
        setRouteError(false);
        onSubmitRoute({
          originId: event.origin,
          result: {
            id: input.id,
            value: boolValue ? boolValue === "true" ? "Yes" : "No" : `${inputValue}`
          },
          route: foundOpenRoute,
          state: stateWithInputValue
        });
      }
      if (!foundOpenRoute && !event.origin) {
        setRouteError(true);
      }
    }
    !inputValue && inputRef.current && inputRef.current.focus();
  }, [event, input, inputVariable, inputValue]);
  react.exports.useEffect(() => {
    inputValue && setRouteError(false);
  }, [inputValue]);
  return /* @__PURE__ */ jsxs("div", {
    className: `${!event.result ? "event-input" : "event-input-result"}`,
    children: [!event.result && input && /* @__PURE__ */ jsxs(Fragment, {
      children: [inputVariable && /* @__PURE__ */ jsxs(Fragment, {
        children: [inputVariable.type !== VARIABLE_TYPE.BOOLEAN && /* @__PURE__ */ jsxs("form", {
          onSubmit: (event2) => {
            event2.preventDefault();
            submitInput();
          },
          children: [/* @__PURE__ */ jsx("input", {
            ref: inputRef,
            id: input.id,
            autoComplete: "off",
            autoFocus: true,
            type: inputVariable.type === VARIABLE_TYPE.STRING ? "text" : "number",
            placeholder: "Response...",
            value: inputValue,
            onChange: (event2) => setInputValue(event2.target.value),
            onFocus: (event2) => event2.target.select()
          }), /* @__PURE__ */ jsx("button", {
            type: "submit",
            children: /* @__PURE__ */ jsxs("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              width: "16",
              height: "16",
              fill: "currentColor",
              viewBox: "0 0 16 16",
              children: [/* @__PURE__ */ jsx("path", {
                d: "M2 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h9.586a2 2 0 0 1 1.414.586l2 2V2a1 1 0 0 0-1-1H2zm12-1a2 2 0 0 1 2 2v12.793a.5.5 0 0 1-.854.353l-2.853-2.853a1 1 0 0 0-.707-.293H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12z"
              }), /* @__PURE__ */ jsx("path", {
                d: "M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"
              })]
            })
          })]
        }), inputVariable.type === VARIABLE_TYPE.BOOLEAN && /* @__PURE__ */ jsxs("div", {
          className: "event-choices",
          children: [/* @__PURE__ */ jsx("button", {
            className: "event-choice",
            onClick: () => submitInput("true"),
            children: "Yes"
          }, "event-passage-input-yes-btn"), /* @__PURE__ */ jsx("button", {
            className: "event-choice",
            onClick: () => submitInput("false"),
            children: "No"
          }, "event-passage-input-no-btn")]
        }), routeError && /* @__PURE__ */ jsx("div", {
          className: "engine-warning-message",
          children: "Missing route."
        })]
      }), !inputVariable && /* @__PURE__ */ jsx("div", {
        className: "engine-warning-message",
        children: "Input variable required."
      })]
    }), event.result && /* @__PURE__ */ jsx("button", {
      disabled: true,
      children: translateEventResultValue(event.result.value)
    })]
  });
});
EventPassageInput.displayName = "EventPassageInput";
function translateEventResultValue(value) {
  switch (value) {
    case ENGINE_EVENT_PASSTHROUGH_RESULT_VALUE:
      return /* @__PURE__ */ jsx(Fragment, {
        children: "Continue"
      });
    case ENGINE_EVENT_LOOPBACK_RESULT_VALUE:
      return /* @__PURE__ */ jsx(Fragment, {
        children: EventLoopbackButtonContent
      });
    case ENGINE_EVENT_GAME_OVER_RESULT_VALUE:
      return /* @__PURE__ */ jsx(Fragment, {
        children: "New Game"
      });
    default:
      return /* @__PURE__ */ jsx(Fragment, {
        children: value
      });
  }
}
const EventPassage = React.memo(({
  passageId,
  event,
  onRouteFound
}) => {
  const {
    engine,
    engineDispatch
  } = react.exports.useContext(EngineContext);
  if (!engine.gameInfo)
    return null;
  const passageRef = react.exports.useRef(null);
  const {
    studioId,
    id: gameId
  } = engine.gameInfo;
  const passage = dexieReactHooks.exports.useLiveQuery(() => new LibraryDatabase(studioId).passages.get(passageId), [passageId]);
  const processRoute = react.exports.useCallback(async ({
    originId,
    result,
    route,
    state
  }) => {
    try {
      let foundPassage;
      if (route) {
        foundPassage = await getPassage(studioId, await findDestinationPassage(studioId, route.destinationId, route.destinationType));
      }
      if (!route) {
        if (result.value !== ENGINE_EVENT_GAME_OVER_RESULT_VALUE && originId) {
          foundPassage = await getPassage(studioId, originId);
        }
        if (result.value === ENGINE_EVENT_GAME_OVER_RESULT_VALUE) {
          const initialEvent = await getEventInitial(studioId, gameId);
          if (initialEvent) {
            foundPassage = await getPassage(studioId, initialEvent.destination);
          }
        }
      }
      if (foundPassage) {
        onRouteFound({
          destinationId: foundPassage.id,
          eventResult: result,
          originId: (route == null ? void 0 : route.destinationType) === COMPONENT_TYPE.PASSAGE ? originId || event.destination : void 0,
          passageType: foundPassage.type,
          routeId: route == null ? void 0 : route.id,
          state
        });
      } else {
        throw "Unable to process route. Could not find passage.";
      }
    } catch (error) {
      throw error;
    }
  }, [passage, event]);
  const [styles, api] = useSpring(() => ({
    height: 0,
    overflow: "hidden"
  }));
  useResizeObserver(passageRef, () => {
    passageRef.current && api.start({
      height: passageRef.current.getBoundingClientRect().height + 1
    });
  });
  return /* @__PURE__ */ jsx(animated.div, {
    style: styles,
    children: /* @__PURE__ */ jsxs("div", {
      className: "event-passage",
      style: {
        borderBottom: event.id === engine.currentEvent ? "none" : "var(--event-passage-bottom-border)"
      },
      ref: passageRef,
      children: [passage && /* @__PURE__ */ jsxs(Fragment, {
        children: [/* @__PURE__ */ jsx(EventPassageContent, {
          content: passage.content,
          state: event.state
        }), passage.type === PASSAGE_TYPE.CHOICE && /* @__PURE__ */ jsx(EventPassageChoices, {
          passage,
          event,
          onSubmitRoute: processRoute
        }), passage.type === PASSAGE_TYPE.INPUT && /* @__PURE__ */ jsx(EventPassageInput, {
          passage,
          event,
          onSubmitRoute: processRoute
        })]
      }), !passage && /* @__PURE__ */ jsxs("div", {
        className: "engine-warning-message",
        children: ["Passage missing or has been removed.", " ", /* @__PURE__ */ jsx("a", {
          onClick: async () => {
            engineDispatch({
              type: ENGINE_ACTION_TYPE.SET_INSTALLED,
              installed: false
            });
          },
          children: "Refresh"
        }), " ", "event stream."]
      })]
    })
  });
});
EventPassage.displayName = "EventPassage";
const Event = ({
  data
}) => {
  const {
    engine,
    engineDispatch
  } = react.exports.useContext(EngineContext);
  if (!engine.gameInfo)
    return null;
  const {
    studioId,
    id: gameId
  } = engine.gameInfo;
  const event = dexieReactHooks.exports.useLiveQuery(() => new LibraryDatabase(studioId).events.get(data.id), []);
  const gotoNextEvent = async ({
    destinationId,
    eventResult,
    originId,
    passageType,
    routeId,
    state
  }) => {
    try {
      await saveEventResult(studioId, data.id, eventResult);
      const nextEventId = v4();
      let eventType;
      switch (eventResult.value) {
        case ENGINE_EVENT_GAME_OVER_RESULT_VALUE:
          eventType = ENGINE_EVENT_TYPE.RESTART;
          break;
        case ENGINE_EVENT_LOOPBACK_RESULT_VALUE:
          eventType = ENGINE_EVENT_TYPE[passageType === PASSAGE_TYPE.CHOICE ? "CHOICE_LOOPBACK" : "INPUT_LOOPBACK"];
          break;
        default:
          eventType = ENGINE_EVENT_TYPE[passageType];
          break;
      }
      const initialEventFromRestart = eventType === ENGINE_EVENT_TYPE.RESTART ? await getEventInitial(studioId, gameId) : void 0;
      if (eventType) {
        await Promise.all([saveEventNext(studioId, data.id, nextEventId), saveEvent(studioId, {
          gameId,
          id: nextEventId,
          destination: destinationId,
          origin: originId,
          state: (initialEventFromRestart == null ? void 0 : initialEventFromRestart.state) || routeId && await processEffectsByRoute(studioId, routeId, state || (event == null ? void 0 : event.state) || data.state) || state || (event == null ? void 0 : event.state) || data.state,
          prev: data.id,
          type: eventType,
          updated: Date.now()
        })]);
        const updatedBookmark = await saveBookmarkEvent(studioId, `${AUTO_ENGINE_BOOKMARK_KEY}${gameId}`, nextEventId);
        await saveEventDate(studioId, nextEventId, updatedBookmark == null ? void 0 : updatedBookmark.updated);
        const nextEvent = await getEvent(studioId, nextEventId);
        if (nextEvent) {
          const currentEvent = await getEvent(studioId, data.id);
          if (currentEvent) {
            engineDispatch({
              type: ENGINE_ACTION_TYPE.UPDATE_EVENT_IN_STREAM,
              event: currentEvent
            });
            engineDispatch({
              type: ENGINE_ACTION_TYPE.APPEND_EVENTS_TO_STREAM,
              events: [nextEvent],
              reset: eventType === ENGINE_EVENT_TYPE.RESTART
            });
            engineDispatch({
              type: ENGINE_ACTION_TYPE.SET_CURRENT_EVENT,
              id: nextEventId
            });
          }
        }
      }
    } catch (error) {
      throw error;
    }
  };
  return /* @__PURE__ */ jsx("div", {
    className: `event ${(event == null ? void 0 : event.result) ? "event-past" : ""}`,
    children: event && /* @__PURE__ */ jsx(Fragment, {
      children: /* @__PURE__ */ jsx(EventPassage, {
        passageId: data.destination,
        event,
        onRouteFound: gotoNextEvent
      })
    })
  });
};
Event.displayName = "Event";
const EventStream = React.memo(() => {
  const eventsRef = react.exports.useRef(null);
  const {
    engine,
    engineDispatch
  } = react.exports.useContext(EngineContext), {
    settings
  } = react.exports.useContext(SettingsContext);
  if (!engine.gameInfo)
    return null;
  const {
    studioId,
    id: gameId
  } = engine.gameInfo;
  const getRecentEvents$1 = react.exports.useCallback(async () => {
    if (engine.installed && engine.currentEvent) {
      const recentEvents = await getRecentEvents(studioId, gameId, engine.currentEvent, 3);
      engineDispatch({
        type: ENGINE_ACTION_TYPE.APPEND_EVENTS_TO_STREAM,
        events: recentEvents,
        reset: true
      });
    }
  }, [engine.installed, engine.currentEvent]);
  useQuery([`recentEvents-${engine.installId}`, studioId, gameId, engine.installed], async () => {
    try {
      await getRecentEvents$1();
    } catch (error) {
      throw error;
    }
    return true;
  }, {
    enabled: engine.currentEvent ? true : false,
    refetchOnMount: "always"
  });
  const eventsArr = dexieReactHooks.exports.useLiveQuery(() => new LibraryDatabase(studioId).events.where({
    gameId
  }).toArray(), []);
  const variablesArr = dexieReactHooks.exports.useLiveQuery(() => new LibraryDatabase(studioId).variables.where({
    gameId
  }).toArray(), []);
  useQuery([`variables-${engine.installId}`, variablesArr], async () => {
    if (engine.isEditor && eventsArr && variablesArr) {
      const variables = {}, initialEventState = {};
      variablesArr.map((variable) => variables[variable.id] = lodash.exports.cloneDeep(variable));
      Object.keys(variables).map((key) => {
        const {
          title,
          type,
          initialValue
        } = lodash.exports.pick(variables[key], ["title", "type", "initialValue"]);
        initialEventState[key] = {
          gameId,
          title,
          type,
          value: initialValue
        };
      });
      await Promise.all([eventsArr.map(async (event) => {
        let updatedEventState = lodash.exports.cloneDeep(event.state);
        Object.keys(event.state).map((variableId) => {
          const foundVariable = variablesArr.find((variable) => variable.id === variableId);
          if (!foundVariable) {
            delete updatedEventState[variableId];
          }
          if (foundVariable) {
            updatedEventState[variableId] = __spreadProps(__spreadValues({}, updatedEventState[variableId]), {
              title: foundVariable.title,
              type: foundVariable.type,
              value: updatedEventState[variableId].type !== foundVariable.type ? foundVariable.initialValue : updatedEventState[variableId].value
            });
          }
        });
        await Promise.all([variablesArr.map(async (variable) => {
          const foundVariable = event.state[variable.id];
          if (!foundVariable) {
            const {
              title,
              type,
              initialValue
            } = lodash.exports.pick(variable, ["title", "type", "initialValue"]);
            updatedEventState[variable.id] = {
              gameId,
              title,
              type,
              value: initialValue
            };
          }
        })]);
        engineDispatch({
          type: ENGINE_ACTION_TYPE.UPDATE_EVENT_IN_STREAM,
          event: __spreadProps(__spreadValues({}, event), {
            state: updatedEventState
          })
        });
        await saveEventState(studioId, event.id, updatedEventState);
      })]);
    }
  });
  const game = dexieReactHooks.exports.useLiveQuery(() => new LibraryDatabase(studioId).games.get(gameId));
  const gameJumps = dexieReactHooks.exports.useLiveQuery(() => new LibraryDatabase(studioId).jumps.where({
    gameId
  }).toArray(), []);
  useQuery([`game-jump-${engine.installId}`, gameJumps], async () => {
    if (engine.isEditor && gameJumps) {
      const foundOnGameStartJump = gameJumps.find((jump) => jump.id === (game == null ? void 0 : game.jump));
      if (foundOnGameStartJump && foundOnGameStartJump.route[1]) {
        const initialEvent = await new LibraryDatabase(studioId).events.get(`${INITIAL_ENGINE_EVENT_ORIGIN_KEY}${gameId}`);
        if (initialEvent && initialEvent.destination !== foundOnGameStartJump.route[1]) {
          await saveEventDestination(studioId, initialEvent.id, foundOnGameStartJump.route[1]);
          engineDispatch({
            type: ENGINE_ACTION_TYPE.SHOW_RESET_NOTIFICATION,
            message: "On game start jump has changed."
          });
        }
      }
    }
  });
  const eventStreamTransitions = useTransition(engine.eventsInStream, {
    from: {
      opacity: 0
    },
    enter: {
      opacity: 1
    },
    config: {
      clamp: true,
      mass: 100,
      tension: 500,
      friction: 60
    },
    trail: 50,
    delay: 250,
    keys: engine.eventsInStream.map((event) => event.id)
  });
  useResizeObserver(eventsRef, () => eventsRef.current && scrollElementToBottom(eventsRef.current));
  react.exports.useEffect(() => {
    eventsRef.current && scrollElementToBottom(eventsRef.current);
  }, [engine.devTools.xrayVisible]);
  return /* @__PURE__ */ jsx(Fragment, {
    children: /* @__PURE__ */ jsx("div", {
      id: "event-stream",
      style: {
        overflowY: settings.open ? "hidden" : "auto",
        top: engine.isEditor ? "0" : "",
        marginBottom: engine.isEditor && engine.devTools.xrayVisible ? ENGINE_XRAY_CONTAINER_HEIGHT : 0
      },
      children: /* @__PURE__ */ jsx("div", {
        id: "events",
        ref: eventsRef,
        children: eventStreamTransitions((styles, event) => /* @__PURE__ */ jsx(animated.div, {
          style: styles,
          children: /* @__PURE__ */ jsx(Event, {
            data: event
          }, event.id)
        }))
      })
    })
  });
});
EventStream.displayName = "EventStream";
const ResetNotification = () => {
  const {
    engine,
    engineDispatch
  } = react.exports.useContext(EngineContext);
  return /* @__PURE__ */ jsx(Fragment, {
    children: engine.resetNotification.showing && /* @__PURE__ */ jsxs("div", {
      id: "engine-reset-notification",
      children: [/* @__PURE__ */ jsx("span", {
        children: engine.resetNotification.message
      }), /* @__PURE__ */ jsx("div", {
        style: {
          textAlign: "right"
        },
        children: /* @__PURE__ */ jsx("button", {
          onClick: () => {
            engineDispatch({
              type: ENGINE_ACTION_TYPE.HIDE_RESET_NOTIFICATION
            });
            engineDispatch({
              type: ENGINE_ACTION_TYPE.SET_INSTALLED,
              installed: false
            });
          },
          children: "Refresh Event Stream"
        })
      })]
    })
  });
};
ResetNotification.displayName = "ResetNotification";
const Renderer = () => {
  const {
    engine,
    engineDispatch
  } = react.exports.useContext(EngineContext);
  const {
    data: autoBookmark
  } = useQuery("autoBookmark", async () => engine.gameInfo && await getBookmarkAuto(engine.gameInfo.studioId, engine.gameInfo.id));
  const startGame = react.exports.useCallback(async () => {
    if (engine.gameInfo) {
      const updatedBookmark = await saveBookmarkEvent(engine.gameInfo.studioId, `${AUTO_ENGINE_BOOKMARK_KEY}${engine.gameInfo.id}`, `${INITIAL_ENGINE_EVENT_ORIGIN_KEY}${engine.gameInfo.id}`);
      updatedBookmark && await saveEventDate(engine.gameInfo.studioId, `${INITIAL_ENGINE_EVENT_ORIGIN_KEY}${engine.gameInfo.id}`, updatedBookmark.updated);
      engineDispatch({
        type: ENGINE_ACTION_TYPE.PLAY,
        fromEvent: `${INITIAL_ENGINE_EVENT_ORIGIN_KEY}${engine.gameInfo.id}`
      });
    }
  }, [engine.gameInfo]);
  const continueGame = react.exports.useCallback(() => {
    autoBookmark && engineDispatch({
      type: ENGINE_ACTION_TYPE.PLAY,
      fromEvent: autoBookmark.event
    });
  }, [autoBookmark]);
  react.exports.useEffect(() => {
    if (engine.gameInfo && engine.isEditor) {
      (autoBookmark == null ? void 0 : autoBookmark.event) ? continueGame() : startGame();
    }
  }, [engine.gameInfo, engine.isEditor]);
  return /* @__PURE__ */ jsx("div", {
    id: "renderer",
    children: engine.gameInfo && /* @__PURE__ */ jsxs(Fragment, {
      children: [!engine.playing && !engine.isEditor && /* @__PURE__ */ jsx(TitleCard, {
        onStartGame: startGame,
        onContinueGame: continueGame
      }), engine.playing && /* @__PURE__ */ jsxs(Fragment, {
        children: [!engine.isEditor && /* @__PURE__ */ jsx(EventStreamTitleBar, {}), /* @__PURE__ */ jsx(EventStream, {}), engine.isEditor && /* @__PURE__ */ jsxs(Fragment, {
          children: [engine.gameInfo && engine.devTools.xrayVisible && /* @__PURE__ */ jsx("div", {
            style: {
              height: ENGINE_XRAY_CONTAINER_HEIGHT,
              width: "100%",
              bottom: 0,
              position: "absolute",
              background: "black",
              overflowY: "auto"
            },
            children: engine.eventsInStream.length > 0 && /* @__PURE__ */ jsx(EventPassageXRay, {
              event: engine.eventsInStream[0]
            })
          }), /* @__PURE__ */ jsx(ResetNotification, {})]
        })]
      })]
    })
  });
};
Renderer.displayName = "Renderer";
const SettingsTitleBar = () => {
  const {
    settingsDispatch
  } = react.exports.useContext(SettingsContext);
  return /* @__PURE__ */ jsxs("div", {
    id: "settings-title-bar",
    className: "title-bar",
    children: [/* @__PURE__ */ jsx("span", {
      id: "settings-title-bar-title",
      className: "title-bar-title",
      children: "Settings"
    }), /* @__PURE__ */ jsx("button", {
      onClick: () => settingsDispatch({
        type: SETTINGS_ACTION_TYPE.CLOSE
      }),
      children: /* @__PURE__ */ jsx("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: "16",
        height: "16",
        fill: "currentColor",
        viewBox: "0 0 16 16",
        children: /* @__PURE__ */ jsx("path", {
          d: "M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z"
        })
      })
    })]
  });
};
SettingsTitleBar.displayName = "SettingsTitleBar";
const Settings = () => {
  const {
    engine
  } = react.exports.useContext(EngineContext), {
    settings,
    settingsDispatch
  } = react.exports.useContext(SettingsContext);
  if (!engine.gameInfo)
    return null;
  const {
    studioId,
    id: gameId
  } = engine.gameInfo;
  const setTheme = react.exports.useCallback(async (theme) => {
    settingsDispatch({
      type: SETTINGS_ACTION_TYPE.SET_THEME,
      theme,
      closeSettings: true
    });
    await saveThemeSetting(studioId, gameId, theme);
  }, [studioId]);
  if (!settings.open)
    return null;
  return /* @__PURE__ */ jsx(Fragment, {
    children: /* @__PURE__ */ jsxs("div", {
      id: "settings",
      children: [/* @__PURE__ */ jsx(SettingsTitleBar, {}), /* @__PURE__ */ jsx("div", {
        id: "settings-content",
        children: /* @__PURE__ */ jsxs("ul", {
          children: [/* @__PURE__ */ jsxs("li", {
            children: ["THEME:", " ", /* @__PURE__ */ jsx("a", {
              className: settings.theme === ENGINE_THEME.CONSOLE ? "settings-active-theme" : "",
              onClick: () => setTheme(ENGINE_THEME.CONSOLE),
              children: "Console"
            }), " ", "|", " ", /* @__PURE__ */ jsx("a", {
              className: settings.theme === ENGINE_THEME.BOOK ? "settings-active-theme" : "",
              onClick: () => setTheme(ENGINE_THEME.BOOK),
              children: "Book"
            }), " "]
          }), /* @__PURE__ */ jsx("li", {
            children: /* @__PURE__ */ jsx("a", {
              onClick: async () => {
                var _a;
                if ((_a = engine.gameInfo) == null ? void 0 : _a.id) {
                  await resetGame(studioId, gameId);
                  location.reload();
                }
              },
              children: "Reset Game Data"
            })
          }), /* @__PURE__ */ jsxs("li", {
            children: ["MODE: ", "production"]
          })]
        })
      })]
    })
  });
};
Settings.displayName = "Settings";
const Theme = ({
  children
}) => {
  const {
    engine
  } = react.exports.useContext(EngineContext), {
    settings,
    settingsDispatch
  } = react.exports.useContext(SettingsContext);
  const theme = useQuery(["theme", engine], async () => {
    if (!engine.gameInfo)
      return;
    const {
      studioId,
      id: gameId
    } = engine.gameInfo;
    return await getThemeSetting(studioId, gameId);
  });
  react.exports.useEffect(() => {
    theme.data && settingsDispatch({
      type: SETTINGS_ACTION_TYPE.SET_THEME,
      theme: theme.data,
      closeSettings: true
    });
  }, [theme.data]);
  react.exports.useEffect(() => {
    settings.theme && document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);
  return /* @__PURE__ */ jsx(Fragment, {
    children: settings.theme && children
  });
};
Theme.displayName = "Theme";
const StartingDestinationGate = React.memo(({
  children,
  studioId,
  gameId
}) => {
  const {
    engine
  } = react.exports.useContext(EngineContext);
  const passageCount = dexieReactHooks.exports.useLiveQuery(() => new LibraryDatabase(studioId).passages.where({
    gameId
  }).count(), [], -1);
  const {
    data: startingDestinationPassage
  } = useQuery([`startingDestination-${gameId}`, studioId, gameId, passageCount], async () => {
    if (!engine.installed) {
      try {
        const foundStartingDestination = await findStartingDestinationPassage(studioId, gameId);
        return foundStartingDestination ? true : false;
      } catch (error) {
        throw error;
      }
    }
    return false;
  }, {
    enabled: !engine.installed && passageCount > 0 ? true : false
  });
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [passageCount === 0 && !engine.installed && /* @__PURE__ */ jsx("div", {
      className: "engine-warning-message",
      style: {
        padding: "1.4rem"
      },
      children: "Scene and passage required to render game."
    }), (startingDestinationPassage || engine.installed || !engine.isEditor) && /* @__PURE__ */ jsx(Fragment, {
      children
    })]
  });
});
StartingDestinationGate.displayName = "StartingDestinationGate";
const DevTools = () => {
  const {
    engineDispatch
  } = react.exports.useContext(EngineContext);
  const processEvent = (event) => {
    const {
      detail
    } = event;
    switch (detail.eventType) {
      case ENGINE_DEVTOOLS_EVENT_TYPE.RESET:
        engineDispatch({
          type: ENGINE_ACTION_TYPE.SET_INSTALLED,
          installed: false
        });
        break;
      case ENGINE_DEVTOOLS_EVENT_TYPE.TOGGLE_EXPRESSIONS:
        engineDispatch({
          type: ENGINE_ACTION_TYPE.TOGGLE_DEVTOOLS_EXPRESSIONS
        });
        break;
      case ENGINE_DEVTOOLS_EVENT_TYPE.TOGGLE_BLOCKED_CHOICES:
        engineDispatch({
          type: ENGINE_ACTION_TYPE.TOGGLE_DEVTOOLS_BLOCKED_CHOICES
        });
        break;
      case ENGINE_DEVTOOLS_EVENT_TYPE.TOGGLE_XRAY:
        engineDispatch({
          type: ENGINE_ACTION_TYPE.TOGGLE_DEVTOOLS_XRAY
        });
        break;
      default:
        throw "Unknown engine event type.";
    }
  };
  react.exports.useEffect(() => {
    window.addEventListener(ENGINE_DEVTOOLS_EVENTS.EDITOR_TO_ENGINE, processEvent);
    return () => {
      window.removeEventListener(ENGINE_DEVTOOLS_EVENTS.EDITOR_TO_ENGINE, processEvent);
    };
  }, []);
  return null;
};
DevTools.displayName = "DevTools";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
});
const Runtime = React.memo(({
  studioId,
  game: {
    id,
    data,
    packed
  }
}) => {
  const isEditor = studioId ? true : false;
  const gameMeta = !isEditor || data ? localStorage.getItem(id) : null;
  const engineData = !gameMeta && data ? packed ? unpackEngineData(data) : JSON.parse(data) : void 0;
  const _studioId = studioId || (engineData == null ? void 0 : engineData._.studioId) || gameMeta && JSON.parse(gameMeta).studioId;
  return /* @__PURE__ */ jsx(QueryClientProvider, {
    client: queryClient,
    children: /* @__PURE__ */ jsx(EngineProvider, {
      children: _studioId && /* @__PURE__ */ jsx(StartingDestinationGate, {
        studioId: _studioId,
        gameId: id,
        children: /* @__PURE__ */ jsxs(Installer, {
          studioId: _studioId,
          gameId: id,
          data: engineData,
          isEditor,
          children: [!isEditor && /* @__PURE__ */ jsx(SettingsProvider, {
            children: /* @__PURE__ */ jsxs(Theme, {
              children: [/* @__PURE__ */ jsx(Settings, {}), /* @__PURE__ */ jsx(Renderer, {})]
            })
          }), isEditor && /* @__PURE__ */ jsxs(Fragment, {
            children: [/* @__PURE__ */ jsx(DevTools, {}), /* @__PURE__ */ jsx(Renderer, {})]
          })]
        })
      })
    })
  });
});
Runtime.displayName = "Runtime";
function main() {
  let ___gameId = "___generated___", ___packedESGEngineData = "___generated___";
  console.info(`powered by Elm Story ${String.fromCodePoint(128218)} 0.5.0 | https://elmstory.com`);
  const rendererContainer = document.getElementById("runtime") || document.body;
  {
    reactDom.exports.render(/* @__PURE__ */ jsx(Runtime, {
      game: {
        id: ___gameId,
        data: ___packedESGEngineData,
        packed: true
      }
    }), rendererContainer);
  }
}
main();
