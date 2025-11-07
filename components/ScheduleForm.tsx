'use client';

import { useState } from 'react';

interface Course {
  name: string;
  time: string;
}

interface Club {
  name: string;
  time: string;
}

interface ScheduleFormProps {
  onSubmit: (data: {
    courses: Course[];
    clubs: Club[];
    goals: string;
  }) => void;
  loading: boolean;
}

export default function ScheduleForm({ onSubmit, loading }: ScheduleFormProps) {
  const [courses, setCourses] = useState<Course[]>([{ name: '', time: '' }]);
  const [clubs, setClubs] = useState<Club[]>([{ name: '', time: '' }]);
  const [goals, setGoals] = useState('');

  const handleCourseChange = (index: number, field: keyof Course, value: string) => {
    const newCourses = [...courses];
    newCourses[index] = { ...newCourses[index], [field]: value };
    setCourses(newCourses);
  };

  const handleClubChange = (index: number, field: keyof Club, value: string) => {
    const newClubs = [...clubs];
    newClubs[index] = { ...newClubs[index], [field]: value };
    setClubs(newClubs);
  };

  const addCourse = () => {
    setCourses([...courses, { name: '', time: '' }]);
  };

  const removeCourse = (index: number) => {
    if (courses.length > 1) {
      setCourses(courses.filter((_, i) => i !== index));
    }
  };

  const addClub = () => {
    setClubs([...clubs, { name: '', time: '' }]);
  };

  const removeClub = (index: number) => {
    if (clubs.length > 1) {
      setClubs(clubs.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty entries
    const validCourses = courses.filter(c => c.name.trim() && c.time.trim());
    const validClubs = clubs.filter(c => c.name.trim() && c.time.trim());
    
    if (validCourses.length === 0 && validClubs.length === 0) {
      alert('Please add at least one course or club');
      return;
    }
    
    if (!goals.trim()) {
      alert('Please enter your goals');
      return;
    }

    onSubmit({
      courses: validCourses,
      clubs: validClubs,
      goals: goals.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
      {/* Courses Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
          Courses
        </h2>
        {courses.map((course, index) => (
          <div key={index} className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  value={course.name}
                  onChange={(e) => handleCourseChange(index, 'name', e.target.value)}
                  placeholder="e.g., Computer Science 101"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  required={index === 0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time
                </label>
                <input
                  type="text"
                  value={course.time}
                  onChange={(e) => handleCourseChange(index, 'time', e.target.value)}
                  placeholder="e.g., Monday 9:00 AM - 10:30 AM"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  required={index === 0}
                />
              </div>
            </div>
            {courses.length > 1 && (
              <button
                type="button"
                onClick={() => removeCourse(index)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
              >
                Remove Course
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addCourse}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
        >
          + Add Another Course
        </button>
      </div>

      {/* Clubs Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
          Clubs & Activities
        </h2>
        {clubs.map((club, index) => (
          <div key={index} className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Club/Activity Name
                </label>
                <input
                  type="text"
                  value={club.name}
                  onChange={(e) => handleClubChange(index, 'name', e.target.value)}
                  placeholder="e.g., Chess Club"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time
                </label>
                <input
                  type="text"
                  value={club.time}
                  onChange={(e) => handleClubChange(index, 'time', e.target.value)}
                  placeholder="e.g., Wednesday 3:00 PM - 5:00 PM"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
            {clubs.length > 1 && (
              <button
                type="button"
                onClick={() => removeClub(index)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
              >
                Remove Club
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addClub}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
        >
          + Add Another Club/Activity
        </button>
      </div>

      {/* Goals Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
          Your Goals
        </h2>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Write 5 sentences about your goals and what you need to do:
        </label>
        <textarea
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          placeholder="e.g., I want to maintain a 3.8 GPA this semester. I need to complete all assignments on time. I want to improve my coding skills through practice. I need to balance my coursework with club activities. I want to network with professionals in my field."
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Getting AI Recommendations...
          </span>
        ) : (
          'Get AI Recommendations'
        )}
      </button>
    </form>
  );
}

