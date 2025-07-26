import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader } from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import { requisitionService } from '@/services/api/requisitionService';
import { interviewService } from '@/services/api/interviewService';

function ScheduleInterviews() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [requisition, setRequisition] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [scheduling, setScheduling] = useState(false);
  
  // Schedule form state
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      
      const [requisitionData, interviewData] = await Promise.all([
        requisitionService.getById(id),
        interviewService.getByRequisition(id)
      ]);
      
      setRequisition(requisitionData);
      setInterviews(interviewData);
      
      // Extract candidates from agency submissions
      const allCandidates = [];
      requisitionData.agencySubmissions.forEach(agency => {
        agency.submissions.forEach(candidate => {
          allCandidates.push({
            ...candidate,
            agencyName: agency.agencyName,
            agencyId: agency.agencyId
          });
        });
      });
      
      setCandidates(allCandidates);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openScheduleModal(candidate) {
    setSelectedCandidate(candidate);
    
    // Check if interview is already scheduled for this candidate
    const existingInterview = interviews.find(i => i.candidateId === candidate.candidateId);
    if (existingInterview) {
      setScheduleDate(existingInterview.scheduledDate || '');
      setScheduleTime(existingInterview.scheduledTime || '');
      setInterviewNotes(existingInterview.notes || '');
    } else {
      setScheduleDate('');
      setScheduleTime('');
      setInterviewNotes('');
    }
    
    setShowScheduleModal(true);
  }

  function closeScheduleModal() {
    setShowScheduleModal(false);
    setSelectedCandidate(null);
    setScheduleDate('');
    setScheduleTime('');
    setInterviewNotes('');
  }

  async function handleScheduleInterview() {
    if (!selectedCandidate || !scheduleDate || !scheduleTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setScheduling(true);
      
      const scheduleData = {
        candidateName: selectedCandidate.candidateName,
        agencyName: selectedCandidate.agencyName,
        scheduledDate: scheduleDate,
        scheduledTime: scheduleTime,
        notes: interviewNotes
      };
      
      await interviewService.scheduleInterview(id, selectedCandidate.candidateId, scheduleData);
      
      toast.success(`Interview scheduled for ${selectedCandidate.candidateName}`);
      closeScheduleModal();
      loadData(); // Refresh data
    } catch (err) {
      console.error('Failed to schedule interview:', err);
      toast.error('Failed to schedule interview');
    } finally {
      setScheduling(false);
    }
  }

  function getInterviewStatus(candidateId) {
    const interview = interviews.find(i => i.candidateId === candidateId);
    return interview || null;
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!requisition) return <Error message="Requisition not found" />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              onClick={() => navigate(`/requisitions/${id}`)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ApperIcon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Schedule Interviews</h1>
          </div>
          <p className="text-gray-600">
            {requisition.title} • {candidates.length} candidates submitted
          </p>
        </div>
      </div>

      {/* Candidates Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Submitted Candidates</h2>
          <p className="text-sm text-gray-600">Manage interview scheduling for all submitted CVs</p>
        </CardHeader>
        <CardContent className="p-0">
          {candidates.length === 0 ? (
            <Empty 
              message="No candidates submitted yet"
              description="Candidates will appear here once agencies submit CVs"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agency
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Experience
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interview Status
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {candidates.map((candidate) => {
                    const interview = getInterviewStatus(candidate.candidateId);
                    
                    return (
                      <motion.tr
                        key={candidate.candidateId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {candidate.candidateName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {candidate.currentCompany}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {candidate.agencyName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ${candidate.hourlyRate}/hr
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {candidate.experience}
                        </td>
                        <td className="px-6 py-4">
                          {interview ? (
                            <div className="flex flex-col gap-1">
                              <Badge variant="success" className="w-fit">
                                <ApperIcon name="Calendar" size={12} className="mr-1" />
                                Scheduled
                              </Badge>
                              <div className="text-xs text-gray-600">
                                {formatDate(interview.scheduledDate)} at {formatTime(interview.scheduledTime)}
                              </div>
                            </div>
                          ) : (
                            <Badge variant="warning" className="w-fit">
                              <ApperIcon name="Clock" size={12} className="mr-1" />
                              Pending
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            size="sm"
                            onClick={() => openScheduleModal(candidate)}
                            className="px-3 py-1.5 text-sm"
                          >
                            <ApperIcon name="Calendar" size={14} className="mr-1" />
                            {interview ? 'Reschedule' : 'Schedule'}
                          </Button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Interview Modal */}
      {showScheduleModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Schedule Interview
                </h3>
                <Button
                  variant="ghost"
                  onClick={closeScheduleModal}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ApperIcon name="X" size={20} />
                </Button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">
                  {selectedCandidate.candidateName}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedCandidate.agencyName} • ${selectedCandidate.hourlyRate}/hr
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <Input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time *
                  </label>
                  <Input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={interviewNotes}
                    onChange={(e) => setInterviewNotes(e.target.value)}
                    placeholder="Interview type, agenda, or special instructions..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={closeScheduleModal}
                  className="flex-1"
                  disabled={scheduling}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleScheduleInterview}
                  disabled={scheduling || !scheduleDate || !scheduleTime}
                  className="flex-1"
                >
                  {scheduling && <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />}
                  {interviews.find(i => i.candidateId === selectedCandidate.candidateId) ? 'Update Schedule' : 'Schedule Interview'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default ScheduleInterviews;