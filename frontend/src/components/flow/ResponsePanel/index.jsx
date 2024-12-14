const ResponsePanel = () => {
  return (
    <div className="response-panel">
      <section className="fields-response-list">
        <Button onClick={handleNewFieldsResponse}>
          New Fields Response
        </Button>
        
        {fieldsResponses.map(fr => (
          <Card title={fr.name}>
            <Preview 
              data={fr.selectedFields}
              sampleData={getSampleData(fr)}
            />
          </Card>
        ))}
      </section>
    </div>
  );
}