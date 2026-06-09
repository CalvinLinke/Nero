import AnimatedSection from "./AnimatedSection";

interface SectionHeadingProps {
  kicker?: string;
  headline: string;
  light?: boolean;
  centered?: boolean;
  className?: string;
}

export default function SectionHeading({
  kicker,
  headline,
  light = false,
  centered = false,
  className = "",
}: SectionHeadingProps) {
  return (
    <AnimatedSection className={`mb-12 ${centered ? "text-center" : ""} ${className}`}>
      {kicker && (
        <p
          className={`text-xs tracking-[0.2em] uppercase mb-4 font-normal ${
            light ? "text-nero-gold" : "text-nero-gold"
          }`}
        >
          {kicker}
        </p>
      )}
      <h2
        className={`font-display text-3xl md:text-4xl lg:text-5xl leading-tight ${
          light ? "text-nero-offwhite" : "text-nero-anthrazit"
        }`}
      >
        {headline}
      </h2>
    </AnimatedSection>
  );
}
