import ShareScreenshot from '../../components/common/ShareScreenshot';
import LuckyColor from '../LuckyColorComponent/LuckyColorComponent';

export default function LuckyColorScreen(props) {
  return (
    <ShareScreenshot fabPosition="bottom-right">
      <LuckyColor {...props} />
    </ShareScreenshot>
  );
} 