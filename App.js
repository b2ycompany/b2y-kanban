import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const statuses = [
  'Ideias',
  'Protótipo',
  'Desenvolvimento',
  'Lançado',
  'Finalizado',
];

export default function App() {
  const [cards, setCards] = useState([]);
  const [newIdea, setNewIdea] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'kanban'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCards(data);
    });
    return () => unsubscribe();
  }, []);

  const handleAddIdea = async () => {
    if (!newIdea) return;
    await addDoc(collection(db, 'kanban'), {
      title: newIdea,
      status: 'Ideias',
    });
    setNewIdea('');
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    await updateDoc(doc(db, 'kanban', draggableId), {
      status: destination.droppableId,
    });
  };

  return (
    <div
      style={{
        background:
          'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        minHeight: '100vh',
        color: 'white',
        padding: 20,
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: 20 }}>
        🚀 B2Y Futurista Kanban
      </h1>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <input
          type="text"
          value={newIdea}
          onChange={(e) => setNewIdea(e.target.value)}
          placeholder="Nova ideia..."
          style={{
            padding: 10,
            fontSize: 16,
            borderRadius: 8,
            border: 'none',
            marginRight: 10,
            width: 300,
          }}
        />
        <button
          onClick={handleAddIdea}
          style={{
            padding: '10px 20px',
            fontSize: 16,
            borderRadius: 8,
            border: 'none',
            backgroundColor: '#2563eb',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Adicionar
        </button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 20,
          }}
        >
          {statuses.map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{
                    backgroundColor: '#374151',
                    borderRadius: 12,
                    padding: 10,
                    minHeight: 400,
                  }}
                >
                  <h2 style={{ textAlign: 'center', marginBottom: 10 }}>
                    {status}
                  </h2>
                  {cards
                    .filter((card) => card.status === status)
                    .map((card, index) => (
                      <Draggable
                        draggableId={card.id}
                        index={index}
                        key={card.id}
                      >
                        {(provided) => (
                          <div
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                            style={{
                              userSelect: 'none',
                              padding: 16,
                              marginBottom: 8,
                              borderRadius: 8,
                              backgroundColor: '#4b5563',
                              color: 'white',
                              ...provided.draggableProps.style,
                            }}
                          >
                            {card.title}
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
