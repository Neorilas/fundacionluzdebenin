interface Props {
  status: 'active' | 'completed' | 'planned';
  label: string;
}

const colors = {
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  planned: 'bg-yellow-100 text-yellow-800',
};

export default function Badge({ status, label }: Props) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
      {label}
    </span>
  );
}
