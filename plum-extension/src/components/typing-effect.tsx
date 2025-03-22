const TypingEffect = ({
 text,
 speed = 30,
 onComplete,
}: {
 text: string;
 speed?: number;
 onComplete: () => void;
}) => {
 const [displayedText, setDisplayedText] = useState("");
 const [currentIndex, setCurrentIndex] = useState(0);

 useEffect(() => {
  if (currentIndex < text.length) {
   const timeout = setTimeout(() => {
    setDisplayedText((prev) => prev + text[currentIndex]);
    setCurrentIndex((prev) => prev + 1);
   }, speed);

   return () => clearTimeout(timeout);
  } else {
   onComplete();
  }
 }, [currentIndex, text, speed, onComplete]);

 return displayedText;
};

export { TypingEffect };
