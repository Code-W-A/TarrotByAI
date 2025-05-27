import ShareScreenshot from '../../components/common/ShareScreenshot';
import LuckyHour from '../LuckyHourComponent/LuckyHourComponent';

export default function LuckyHourScreen(props) {
  return (
    <ShareScreenshot fabPosition="bottom-right">
      <LuckyHour {...props} />
    </ShareScreenshot>
  );
} 