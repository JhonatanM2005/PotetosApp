import PropTypes from "prop-types";

export default function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  gradient = "from-primary to-primary/80",
}) {
  return (
    <div
      className={`bg-linear-to-br ${gradient} rounded-2xl shadow-lg p-6 text-white`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-sm font-semibold opacity-90 mb-1">{title}</h4>
      <p className="text-3xl font-bold">{value}</p>
      {subtitle && <p className="text-xs mt-2 opacity-80">{subtitle}</p>}
    </div>
  );
}

StatCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  gradient: PropTypes.string,
};
