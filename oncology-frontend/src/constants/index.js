import { records, screening, user, apps, research, dna, aiAgent, search } from "../assets";
import { Presentation } from 'lucide-react';
import { BsChatLeftText, BsCalendarCheck, BsShieldCheck } from 'react-icons/bs';
import { RiDashboardLine } from 'react-icons/ri';
import { FaChartLine, FaFlask } from 'react-icons/fa';
import { GiDna1 } from 'react-icons/gi';
import { LuTarget } from 'react-icons/lu';
import { GrDocumentTest } from 'react-icons/gr';

export const navlinks = [
  {
    name: "dashboard",
    imgUrl: apps,
    link: '/dashboard',
  },
  {
    name: "research",
    imgUrl: research,
    link: "/medical-records/pat12344/research",
  },
  {
    name: "mutations",
    imgUrl: dna,
    link: "/mutation-explorer/pat12345",
  },
  {
    name: "agents",
    imgUrl: aiAgent,
    link: "/agent-dashboard",
  },
  {
    name: "agentStudio",
    imgUrl: aiAgent,
    link: "/agent-studio",
  },
  {
    name: "validator",
    imgUrl: research,
    link: "/validate",
  },
  {
    name: 'create-campaign',
    imgUrl: research,
    link: '/create-campaign',
  },
  {
    name: 'validate',
    imgUrl: research,
    link: '/hypothesis-validator',
  },
  {
    name: 'threat-assessor',
    imgUrl: dna,
    link: '/threat-assessor',
  },
  {
    name: 'radonc-co-pilot',
    imgUrl: screening,
    link: '/radonc-co-pilot',
  },
  {
    name: 'crispr-designer',
    imgUrl: research,
    link: '/crispr-designer',
  },
  {
    name: 'demo-summarizer',
    imgUrl: aiAgent,
    link: '/demo-summarizer',
  },
  {
    name: 'runx1-conquest',
    imgUrl: research,
    link: '/campaigns/pik3ca-de-risking',
    disabled: true,
  },
  {
    name: 'tools',
    imgUrl: apps, // Placeholder icon
    link: '/tools',
  },
  {
    name: 'metastasis',
    imgUrl: dna, // DNA icon for metastasis cascade
    link: '/metastasis',
  },
  {
    name: "profile",
    imgUrl: user,
    link: "/profile",
  },
  {
    name: 'dossier',
    imgUrl: research,
    link: '/dossier',
  },
  {
    name: 'Hypothesis Validator',
    imgUrl: research,
    link: '/validate',
  },
  {
    name: 'ayesha-care',
    imgUrl: research,
    link: '/ayesha-complete-care',
  },
  {
    name: 'sporadic-cancer',
    imgUrl: dna,
    link: '/sporadic-cancer',
  },
  {
    name: 'food-validator',
    imgUrl: research,
    link: '/food-validator',
  },
  {
    name: 'hypothesis-tester',
    imgUrl: research,
    link: '/holistic-hypothesis-tester',
  },
  {
    name: 'ayesha-demo',
    imgUrl: research,
    link: '/ayesha-twin-demo',
  },
  {
    name: 'ayesha-trials',
    imgUrl: research,
    link: '/ayesha-trials',
  },
  // {
  //   name: 'Investor Slideshow',
  //   icon: Presentation,
  //   path: '/investor-slideshow'
  // }
];
