import ShareScreenshot from '../../components/common/ShareScreenshot';
import LuckyNumber from '../LuckyNumberComponent/LuckyNumberComponent';

export default function LuckyNumberScreen(props) {
  return (
    <ShareScreenshot fabPosition="bottom-right">
      <LuckyNumber {...props} />
    </ShareScreenshot>
  );
} 