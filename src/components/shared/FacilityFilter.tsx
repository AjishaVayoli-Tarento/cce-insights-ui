import { useContext } from 'react';
import { FilterContext } from '../../context/FilterContext';
import { useFacilityLookup } from '../../hooks/useLookups';

export function FacilityFilter() {
  const { facilityId, setFacilityId } = useContext(FilterContext);
  const facilities = useFacilityLookup();

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-gray-500">Facility</label>
      <select
        value={facilityId || ''}
        onChange={(e) => setFacilityId(e.target.value || undefined)}
        className="w-40 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      >
        <option value="">All facilities</option>
        {facilities.data?.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>
    </div>
  );
}
