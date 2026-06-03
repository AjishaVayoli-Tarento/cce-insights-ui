import { PageHeader } from '../components/shared/PageHeader';
import { Card } from '../components/shared/Card';

const DISPUTE_DATA = [
  { id: 'DSP-001', patient: 'NID-2026-020', action: 'ANC Visit 2 Referral Escalation', type: 'OVERDUE', facility: 'facility-moyamba', raisedAt: '2026-02-08', status: 'Open' },
  { id: 'DSP-002', patient: 'NID-2026-051', action: 'ANC Visit 1 Referral Escalation', type: 'OVERDUE', facility: 'facility-makeni', raisedAt: '2026-01-05', status: 'Open' },
  { id: 'DSP-003', patient: 'NID-2026-014', action: 'Referral Consultation Overdue Notification', type: 'MISSED', facility: 'facility-moyamba', raisedAt: '2026-02-12', status: 'Under Review' },
  { id: 'DSP-004', patient: 'NID-2026-033', action: 'Overdue Response Notification', type: 'OVERDUE', facility: 'facility-makeni', raisedAt: '2026-01-20', status: 'Open' },
  { id: 'DSP-005', patient: 'NID-2026-009', action: 'ANC Visit 3 Referral Escalation', type: 'OVERDUE', facility: 'facility-moyamba', raisedAt: '2026-03-01', status: 'Resolved' },
  { id: 'DSP-006', patient: 'NID-2026-041', action: 'Referral Consultation Overdue Notification', type: 'MISSED', facility: 'facility-makeni', raisedAt: '2026-02-25', status: 'Open' },
  { id: 'DSP-007', patient: 'NID-2026-018', action: 'Overdue Response Notification', type: 'OVERDUE', facility: 'facility-moyamba', raisedAt: '2026-03-10', status: 'Under Review' },
];

const STATUS_STYLES: Record<string, string> = {
  'Open': 'bg-red-50 text-red-700',
  'Under Review': 'bg-amber-50 text-amber-700',
  'Resolved': 'bg-green-50 text-green-700',
};

export default function CcnDisputes() {
  return (
    <>
      <PageHeader title="Disputes" description="Disputes raised on deviations" />

      <Card title="Dispute List">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500">
                <th className="pb-2 pr-4">ID</th>
                <th className="pb-2 pr-4">Patient</th>
                <th className="pb-2 pr-4">Action</th>
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">Facility</th>
                <th className="pb-2 pr-4">Raised</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {DISPUTE_DATA.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="py-2 pr-4 font-medium text-gray-900">{d.id}</td>
                  <td className="py-2 pr-4 text-gray-700">{d.patient}</td>
                  <td className="py-2 pr-4 text-gray-700">{d.action}</td>
                  <td className="py-2 pr-4">
                    <span className={`text-xs font-bold ${d.type === 'OVERDUE' ? 'text-amber-600' : 'text-red-600'}`}>
                      {d.type}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-gray-600">{d.facility}</td>
                  <td className="py-2 pr-4 text-gray-600">{d.raisedAt}</td>
                  <td className="py-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[d.status] ?? 'bg-gray-50 text-gray-700'}`}>
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
