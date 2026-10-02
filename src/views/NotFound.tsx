import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <PageHeader title={t('notFound.title')} subtitle={t('notFound.subtitle')} />
      <div className="container mx-auto px-4 py-12 text-center">
        <Link to="/">
          <Button className="apple-button">
            {t('notFound.backHome')}
          </Button>
        </Link>
      </div>
    </Layout>
  );
};

export default NotFound;
