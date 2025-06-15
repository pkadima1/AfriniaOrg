
const ResponseTime = () => {
  return (
    <section className="py-20 px-6 lg:px-8 bg-dark-surface">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">
          We'll Respond <span className="gradient-text">Quickly</span>
        </h2>
        <p className="text-xl text-text-secondary mb-8">
          Our team typically responds to inquiries within 2-4 hours during business hours.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">&lt; 2hrs</div>
            <div className="text-text-secondary">Sales Inquiries</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">&lt; 4hrs</div>
            <div className="text-text-secondary">General Questions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">&lt; 24hrs</div>
            <div className="text-text-secondary">Technical Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResponseTime;
