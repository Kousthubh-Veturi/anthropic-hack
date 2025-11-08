'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, BookOpen, Users, Target, Loader2 } from 'lucide-react';

interface Course {
  name: string;
  courseId: string;
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
  const [courses, setCourses] = useState<Course[]>([{ name: '', courseId: '', time: '' }]);
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
    setCourses([...courses, { name: '', courseId: '', time: '' }]);
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
    
    const validCourses = courses.filter(c => c.courseId.trim() && c.time.trim());
    const validClubs = clubs.filter(c => c.name.trim() && c.time.trim());
    
    if (validCourses.length === 0 && validClubs.length === 0) {
      alert('Please add at least one course or club');
      return;
    }
    
    const invalidCourses = validCourses.filter(c => !c.courseId.trim() || !c.time.trim());
    if (invalidCourses.length > 0) {
      alert('All courses must have a Course ID and Time');
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Courses Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Courses</CardTitle>
          </div>
          <CardDescription>
            Add your courses with their UMD course IDs and meeting times
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {courses.map((course, index) => (
            <Card key={index} className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`course-id-${index}`}>
                      Course ID <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`course-id-${index}`}
                      type="text"
                      value={course.courseId}
                      onChange={(e) => handleCourseChange(index, 'courseId', e.target.value.toUpperCase())}
                      placeholder="CMSC216"
                      required
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      UMD course identifier (e.g., CMSC216, ENES140)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`course-name-${index}`}>
                      Course Name
                    </Label>
                    <Input
                      id={`course-name-${index}`}
                      type="text"
                      value={course.name}
                      placeholder="Auto-filled from UMD API"
                      readOnly
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Will be automatically fetched
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`course-time-${index}`}>
                      Meeting Time <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`course-time-${index}`}
                      type="text"
                      value={course.time}
                      onChange={(e) => handleCourseChange(index, 'time', e.target.value)}
                      placeholder="Tuesday & Thursday 11:00 AM - 12:15 PM"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Days and times (e.g., "MWF 9:00 AM - 10:00 AM")
                    </p>
                  </div>
                </div>
                
                {courses.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCourse(index)}
                    className="mt-4 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Course
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addCourse}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Course
          </Button>
        </CardContent>
      </Card>

      {/* Clubs Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Clubs & Activities</CardTitle>
          </div>
          <CardDescription>
            Add your extracurricular activities and their meeting times
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {clubs.map((club, index) => (
            <Card key={index} className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`club-name-${index}`}>
                      Activity Name
                    </Label>
                    <Input
                      id={`club-name-${index}`}
                      type="text"
                      value={club.name}
                      onChange={(e) => handleClubChange(index, 'name', e.target.value)}
                      placeholder="Chess Club, Part-time Job, etc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`club-time-${index}`}>
                      Meeting Time
                    </Label>
                    <Input
                      id={`club-time-${index}`}
                      type="text"
                      value={club.time}
                      onChange={(e) => handleClubChange(index, 'time', e.target.value)}
                      placeholder="Wednesday 3:00 PM - 5:00 PM"
                    />
                  </div>
                </div>
                
                {clubs.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeClub(index)}
                    className="mt-4 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Activity
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addClub}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Activity
          </Button>
        </CardContent>
      </Card>

      {/* Goals Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Your Goals</CardTitle>
          </div>
          <CardDescription>
            Describe your academic and personal goals (at least 5 sentences)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="goals">
              Goals & Objectives <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="goals"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="I want to maintain a 3.8 GPA this semester. I need to complete all assignments on time. I want to improve my coding skills through practice. I need to balance my coursework with club activities. I want to network with professionals in my field."
              rows={6}
              required
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {goals.split(/[.!?]+/).filter(s => s.trim().length > 0).length} sentences entered
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 text-lg"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating Schedule...
          </>
        ) : (
          <>
            <Target className="mr-2 h-5 w-5" />
            Get AI Schedule Recommendations
          </>
        )}
      </Button>
    </form>
  );
}
