import React from 'react'

import {
  DragDropContext,
  DragUpdate,
  Droppable,
  DropResult,
  ResponderProvided
} from 'react-beautiful-dnd'

const DragDropWrapper: React.FC<{
  onDragEnd: (result: DropResult, provided: ResponderProvided) => void
  onDragUpdate?: (initial: DragUpdate, provided: ResponderProvided) => void
}> = ({ onDragEnd, onDragUpdate, children }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd} onDragUpdate={onDragUpdate}>
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
