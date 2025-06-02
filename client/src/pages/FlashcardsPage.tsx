import React, { useState } from 'react';
import { useFlashcards, Flashcard } from '../contexts/FlashcardContext';
import FlashcardItem from '../components/FlashcardItem';
import { Plus, Download, Upload, Trash2 } from 'lucide-react';

const FlashcardsPage: React.FC = () => {
  const { 
    flashcards, 
    addFlashcard, 
    deleteFlashcard, 
    clearAllFlashcards,
    exportFlashcards,
    importFlashcards,
    updateLastReviewed
  } = useFlashcards();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [importText, setImportText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  
  const handleAddFlashcard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestion.trim() && newAnswer.trim()) {
      addFlashcard(newQuestion, newAnswer);
      setNewQuestion('');
      setNewAnswer('');
      setShowAddForm(false);
    }
  };
  
  const handleExport = () => {
    const jsonData = exportFlashcards();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `studybuddy-flashcards-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleImport = () => {
    if (importFlashcards(importText)) {
      setImportText('');
      setShowImportModal(false);
      alert('Flashcards imported successfully!');
    } else {
      alert('Invalid flashcard data. Please check the format and try again.');
    }
  };
  
  return (
    <div>
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 mb-2">Flashcards</h1>
            <p className="text-gray-600">
              Create and review flashcards to reinforce your learning. Flashcards are saved locally and available offline.
            </p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
            >
              <Plus size={20} className="mr-1" />
              New Flashcard
            </button>
            
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-outline">
                More Actions
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                  <button onClick={handleExport}>
                    <Download size={16} />
                    Export Flashcards
                  </button>
                </li>
                <li>
                  <button onClick={() => setShowImportModal(true)}>
                    <Upload size={16} />
                    Import Flashcards
                  </button>
                </li>
                {flashcards.length > 0 && (
                  <li>
                    <button onClick={clearAllFlashcards} className="text-error">
                      <Trash2 size={16} />
                      Clear All
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Flashcard grid */}
        {flashcards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashcards.map((card) => (
              <FlashcardItem 
                key={card.id} 
                flashcard={card} 
                onDelete={deleteFlashcard}
                onReview={updateLastReviewed}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-base-200 rounded-lg">
            <p className="text-lg mb-4">No flashcards yet</p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
            >
              Create your first flashcard
            </button>
          </div>
        )}
      </div>
      
      {/* Add Flashcard Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Create New Flashcard</h3>
              <form onSubmit={handleAddFlashcard}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Question</span>
                  </label>
                  <input 
                    type="text" 
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Enter your question"
                    required
                  />
                </div>
                <div className="form-control mb-6">
                  <label className="label">
                    <span className="label-text">Answer</span>
                  </label>
                  <textarea 
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    className="textarea textarea-bordered w-full h-32"
                    placeholder="Enter the answer"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={!newQuestion.trim() || !newAnswer.trim()}
                  >
                    Create Flashcard
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Import Flashcards</h3>
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text">Paste JSON data</span>
                </label>
                <textarea 
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="textarea textarea-bordered w-full h-40"
                  placeholder="Paste exported flashcard JSON here"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowImportModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleImport}
                  disabled={!importText.trim()}
                >
                  Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardsPage;