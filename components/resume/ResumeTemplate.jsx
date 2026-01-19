import LatexResume from './templates/LatexResume';
import CreativeResume from './templates/CreativeResume';
import ModernResume from './templates/ModernResume';
import ExecutiveResume from './templates/ExecutiveResume';

const ResumeTemplate = ({ templateId = 1, data }) => {
    switch (templateId) {
        case 1:
            return <LatexResume data={data} />;
        case 2:
            return <CreativeResume data={data} />;
        case 3:
            return <ModernResume data={data} />;
        case 4:
            return <ExecutiveResume data={data} />;
        default:
            return <LatexResume data={data} />;
    }
};

export default ResumeTemplate;