import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

export default function ModuleCard({
  icon: Icon,
  title,
  description,
  path,
  iconBg = "bg-primary",
}) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(path)}
      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 group border border-gray-100"
    >
      <div
        className={`w-14 h-14 ${iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
      >
        <Icon className="w-8 h-8 text-secondary" />
      </div>
      <h3 className="text-lg font-bold text-primary mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <div className="flex items-center text-secondary font-semibold text-sm group-hover:gap-2 transition-all">
        Acceder
        <span className="ml-1 group-hover:ml-2 transition-all">→</span>
      </div>
    </div>
  );
}

ModuleCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  iconBg: PropTypes.string,
};
