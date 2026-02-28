interface Props {
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
}

export default function SectionTitle({ title, subtitle, centered = true, light = false }: Props) {
  return (
    <div className={`mb-10 ${centered ? 'text-center' : ''}`}>
      <h2 className={`text-3xl sm:text-4xl font-bold mb-3 ${light ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-lg max-w-2xl ${centered ? 'mx-auto' : ''} ${light ? 'text-primary-100' : 'text-muted'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
