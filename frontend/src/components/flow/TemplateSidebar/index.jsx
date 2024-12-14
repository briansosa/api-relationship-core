const TemplateSidebar = () => {
  return (
    <div className="template-sidebar">
      <section className="templates-list">
        {templates.map(template => (
          <div 
            className="template-item"
            draggable
            onDragStart={(e) => handleDragStart(e, template)}
          >
            <div className="template-info">
              <h4>{template.name}</h4>
              <small>{template.parameters.length} inputs</small>
              <small>{template.response.length} outputs</small>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}