import HeroV2 from './HeroV2'
import Intro from './Intro'
import Ticker from './Ticker'
import Cases from './Cases'
import Services from './Services'
import Fill from './Fill'
import Process from './Process'
import FooterV2 from './FooterV2'

export default function HomePage({ ready }: { ready: boolean }) {
  return (
    <>
      <HeroV2 ready={ready} />
      <Intro />
      <Ticker />
      <Cases />
      <Services />
      <Fill />
      <Process />
      <FooterV2 />
    </>
  )
}
