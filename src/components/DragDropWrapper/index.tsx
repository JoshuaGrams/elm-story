import React from 'react'

import {
  DragDropContext,
  DragStart,
  DragUpdate,
  Droppable,
  DropResult,
  ResponderProvided
} from 'react-beautiful-dnd'

const DragDropWrapper: React.FC<{
  onBeforeDragStart?: (initial: DragStart) => void
  onDragStart?: (initial: DragStart, provided: ResponderProvided) => void
  onDragEnd: (result: DropResult, provided: ResponderProvided) => void
  onDragUpdate?: (initial: DragUpdate, provided: ResponderProvided) => void
}> = ({
  onBeforeDragStart,
  onDragStart,
  onDragEnd,
  onDragUpdate,
  children
}) => {
  return (
    <DragDropContext
      onBeforeDragStart={onBeforeDragStart}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragUpdate={onDragUpdate}
    >
      <Droppable droppableId={'editable'}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {children}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

DragDropWrapper.displayName = 'DragDropWrapper'

export default DragDropWrapper
