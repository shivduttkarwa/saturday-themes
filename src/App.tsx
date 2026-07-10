import V1 from './V1'
import V2 from './v2/V2'

function VersionSwitch({ version }: { version: 1 | 2 }) {
  return (
    <div className="vswitch">
      <a href="?v=1" className={version === 1 ? 'on' : ''}>
        V1
      </a>
      <a href="?v=2" className={version === 2 ? 'on' : ''}>
        V2
      </a>
    </div>
  )
}

export default function App() {
  const version = new URLSearchParams(window.location.search).get('v') === '1' ? 1 : 2

  return (
    <>
      {version === 1 ? <V1 /> : <V2 />}
      <VersionSwitch version={version} />
    </>
  )
}
