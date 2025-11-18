import PropTypes from "prop-types";

export default function InfoCard({ label, value, bgColor = "bg-[#272159]" }) {
  return (
    <div className={`${bgColor} rounded-2xl p-6`}>
      <p className="text-sm text-gray-300 mb-2">{label}</p>
      <p className="text-lg font-semibold text-white break-all">{value}</p>
    </div>
  );
}

InfoCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  bgColor: PropTypes.string,
};
