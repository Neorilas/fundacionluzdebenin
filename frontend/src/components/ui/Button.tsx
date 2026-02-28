import Link from 'next/link';

interface Props {
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const variants = {
  primary: 'bg-primary-800 text-white hover:bg-primary-900',
  accent: 'bg-accent text-white hover:bg-accent-700',
  outline: 'border-2 border-primary-800 text-primary-800 hover:bg-primary-800 hover:text-white',
  ghost: 'text-primary-800 hover:bg-primary-50',
};

const sizes = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3 text-base',
};

export default function Button({
  href, onClick, variant = 'primary', size = 'md', children, className = '', type = 'button', disabled,
}: Props) {
  const base = `inline-flex items-center justify-center font-semibold rounded-full transition-colors ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return <Link href={href} className={base}>{children}</Link>;
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} disabled:opacity-50 disabled:cursor-not-allowed`}>
      {children}
    </button>
  );
}
