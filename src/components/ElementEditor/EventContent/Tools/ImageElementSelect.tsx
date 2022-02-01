import React from 'react'

import styles from './styles.module.less'

const ImageElementSelect: React.FC = () => {
  return (
    <div className={styles.ImageSelect}>
      <div className={styles.image} />
    </div>
  )
}

ImageElementSelect.displayName = 'ImageElementSelect'

export default ImageElementSelect

// const editor = useSlateStatic()
//   const path = ReactEditor.findPath(editor, element)
//   const focused = useFocused()
//   const selected = useSelected()

{
  /* <div
        className={`content-image ${selected ? 'selected' : ''}`}
        style={{
          boxShadow: `${
            selected && focused ? '0 0 0 3px var(--highlight-color)' : 'none'
          }`
        }}
        contentEditable={false}
      >
        <img
          draggable="false"
          src={element.url}
          style={{
            display: 'block',
            maxWidth: '100%',
            maxHeight: '30em'
          }}
        />
        <Button
          className="remove-image-button"
          style={{
            position: 'absolute',
            right: '10px',
            bottom: '10px'
          }}
        >
          <DeleteOutlined
            onClick={() => Transforms.removeNodes(editor, { at: path })}
          />
        </Button>
      </div> */
}
