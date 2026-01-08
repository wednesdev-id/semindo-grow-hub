import { useState } from 'react';
import { Upload, Plus, Trash, Save, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [courseData, setCourseData] = useState({
    title: '',
    category: '',
    level: 'Beginner',
    price: '',
    description: '',
    learningOutcomes: [''],
    requirements: [''],
    thumbnail: null as File | null
  });

  const handleAddField = (field: 'learningOutcomes' | 'requirements') => {
    setCourseData({
      ...courseData,
      [field]: [...courseData[field], '']
    });
  };

  const handleFieldChange = (field: 'learningOutcomes' | 'requirements', index: number, value: string) => {
    const newArray = [...courseData[field]];
    newArray[index] = value;
    setCourseData({
      ...courseData,
      [field]: newArray
    });
  };

  const handleRemoveField = (field: 'learningOutcomes' | 'requirements', index: number) => {
    const newArray = courseData[field].filter((_, i) => i !== index);
    setCourseData({
      ...courseData,
      [field]: newArray
    });
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // Calls API to create course
      console.log('Submitting course:', courseData);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Course created successfully!');
      navigate('/consultation/dashboard');
    } catch (error) {
      console.error('Failed to create course:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        <StepIndicator number={1} title="Course Details" active={step >= 1} />
        <div className={`h-1 flex-1 mx-4 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
        <StepIndicator number={2} title="Curriculum" active={step >= 2} />
        <div className={`h-1 flex-1 mx-4 ${step >= 3 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
        <StepIndicator number={3} title="Review" active={step >= 3} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-6">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
              <input
                type="text"
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. Digital Marketing Masterclass 2024"
                value={courseData.title}
                onChange={e => setCourseData({...courseData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  className="w-full border rounded-lg p-2"
                  value={courseData.category}
                  onChange={e => setCourseData({...courseData, category: e.target.value})}
                >
                  <option value="">Select Category</option>
                  <option value="marketing">Marketing</option>
                  <option value="finance">Finance</option>
                  <option value="operations">Operations</option>
                  <option value="hr">Human Resources</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select 
                  className="w-full border rounded-lg p-2"
                  value={courseData.level}
                  onChange={e => setCourseData({...courseData, level: e.target.value})}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (IDR)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                <input
                  type="number"
                  className="w-full border rounded-lg p-2 pl-10"
                  placeholder="0 for free"
                  value={courseData.price}
                  onChange={e => setCourseData({...courseData, price: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full border rounded-lg p-2 h-32"
                placeholder="What will students learn in this course?"
                value={courseData.description}
                onChange={e => setCourseData({...courseData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition cursor-pointer">
                <Upload className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold mb-6">Course Content</h2>

            {/* Learning Outcomes */}
            <div>
              <label className="block text-lg font-medium text-gray-900 mb-4">What will students learn?</label>
              <div className="space-y-3">
                {courseData.learningOutcomes.map((outcome, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 border rounded-lg p-2"
                      placeholder="e.g. Understand basic accounting principles"
                      value={outcome}
                      onChange={e => handleFieldChange('learningOutcomes', index, e.target.value)}
                    />
                    <button 
                      onClick={() => handleRemoveField('learningOutcomes', index)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => handleAddField('learningOutcomes')}
                  className="text-purple-600 font-medium flex items-center gap-2 hover:bg-purple-50 px-3 py-1 rounded w-fit"
                >
                  <Plus size={18} /> Add Outcome
                </button>
              </div>
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-lg font-medium text-gray-900 mb-4">Requirements / Prerequisites</label>
              <div className="space-y-3">
                {courseData.requirements.map((req, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 border rounded-lg p-2"
                      placeholder="e.g. Basic knowledge of Excel"
                      value={req}
                      onChange={e => handleFieldChange('requirements', index, e.target.value)}
                    />
                    <button 
                      onClick={() => handleRemoveField('requirements', index)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => handleAddField('requirements')}
                  className="text-purple-600 font-medium flex items-center gap-2 hover:bg-purple-50 px-3 py-1 rounded w-fit"
                >
                  <Plus size={18} /> Add Requirement
                </button>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg text-yellow-800 text-sm">
              Note: You can add video modules and quizzes after creating the course shell.
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-6">Review & Create</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div>
                <span className="text-gray-500 text-sm">Title</span>
                <p className="font-medium text-lg">{courseData.title || 'Untitled Course'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 text-sm">Category</span>
                  <p className="font-medium">{courseData.category || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Level</span>
                  <p className="font-medium">{courseData.level}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Price</span>
                  <p className="font-medium">
                    {courseData.price ? `Rp ${parseInt(courseData.price).toLocaleString()}` : 'Free'}
                  </p>
                </div>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Outcomes</span>
                <ul className="list-disc list-inside mt-1">
                  {courseData.learningOutcomes.filter(o => o).map((outcome, i) => (
                    <li key={i}>{outcome}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between pt-6 border-t">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 font-medium"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}
          
          {step < 3 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2"
            >
              Next <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
            >
              {loading ? 'Creating...' : 'Create Course'} <Check size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ number, title, active }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
        active ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
      }`}>
        {number}
      </div>
      <span className={`font-medium ${active ? 'text-gray-900' : 'text-gray-400'}`}>
        {title}
      </span>
    </div>
  );
}
