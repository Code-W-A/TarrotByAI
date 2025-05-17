import { useNavBarVisibility } from '../context/NavbarVisibilityContext';

const OnboardingScreen = (props) => {
  const { setIsNavBarVisible } = useNavBarVisibility();
  React.useEffect(() => {
    setIsNavBarVisible(false);
    return () => setIsNavBarVisible(true);
  }, []);
  // ... existing code ...
}; 