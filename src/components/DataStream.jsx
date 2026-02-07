import { memo } from 'react';
import './DataStream.css';

const STREAM_ITEMS = [
  'SYS_OK', 'NET::STABLE', 'FIREWALL::UP', 'MEM::OPTIMAL',
  'NODE_v20', 'REACT_19', '暗号化::AES-256', 'UPLINK::4G',
  'CPU::87%', 'CACHE::HIT', 'PKG::SYNCED', 'BUILD::PASS',
  'THREAT::NONE', 'LATENCY::2ms', 'VITE_6', 'DOCKER::RUN',
];

function DataStream() {
  // Double the items for seamless infinite scroll
  const items = [...STREAM_ITEMS, ...STREAM_ITEMS];

  return (
    <div className="data-stream" aria-hidden="true">
      <div className="data-stream__track">
        {items.map((item, i) => (
          <span key={i} className="data-stream__item">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default memo(DataStream);
