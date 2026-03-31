import { useContext } from 'react';
import { FilterContext } from '../../context/FilterContext';

export function FacilityFilter() {
  const { facilityId, setFacilityId } = useContext(FilterContext);

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-gray-500">Facility</label>
      <input
        type="text"
        value={facilityId || ''}
        onChange={(e) => setFacilityId(e.target.value || undefined)}
        placeholder="All facilities"
        className="w-40 rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}
