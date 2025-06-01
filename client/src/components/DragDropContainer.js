import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const DragDropContainer = ({ items, onDragEnd, title }) => {
  return (
    <div className="drag-drop-container">
      <h3>{title}</h3>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`drag-container ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
            >
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`draggable-item ${snapshot.isDragging ? 'dragging' : ''}`}
                    >
                      <div className="drag-item-content">
                        <span className="drag-item-title">{item.name}</span>
                        <span className="drag-item-type">{item.type}</span>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default DragDropContainer;
