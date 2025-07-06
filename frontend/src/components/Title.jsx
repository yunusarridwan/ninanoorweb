import PropTypes from "prop-types";

const Title = ({title1, title2, titleStyles, title1Styles, paraStyles}) => {
  return (
    <div className={`${titleStyles} pb-1`}>
      <h2 className={`${title1Styles} h2`}>{title1}
        <span className='text-secondary !font-light'> {title2}</span>
      </h2>
      <p className={`${paraStyles} hidden`}>
        Our food products are crafted with the finest ingredients to <br />
        deliver exceptional taste and quality.
      </p>
    </div>
  )
}

// ✅ Add PropTypes
Title.propTypes = {
  title1: PropTypes.string.isRequired, 
  title2: PropTypes.string, 
  titleStyles: PropTypes.string,
  title1Styles: PropTypes.string,
  paraStyles: PropTypes.string, 
};

export default Title