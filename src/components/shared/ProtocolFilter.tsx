import { useEffect } from 'react';
import { useProtocols } from '../../hooks/useLookups';

interface ProtocolFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProtocolFilter({ value, onChange }: ProtocolFilterProps) {
  const protocols = useProtocols();

  useEffect(() => {
    if (!value && protocols.data && protocols.data.length > 0) {
      onChange(protocols.data[0].id);
    }
  }, [protocols.data, value, onChange]);

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-gray-500">Protocol</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-56 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      >
        <option value="">All Protocols</option>
        {protocols.data?.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title || p.url.split('/').pop()} (v{p.version})
          </option>
        ))}
      </select>
    </div>
  );
}
