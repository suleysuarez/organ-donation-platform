import '../styles/PageModuleHeader.css'

function PageModuleHeader({ image, title, subtitle }) {
  return (
    <div className="page-module-header">
      <div className="page-module-copy">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {image && (
        <div className="page-module-image">
          <img src={image} alt="" />
        </div>
      )}
    </div>
  )
}

export default PageModuleHeader
