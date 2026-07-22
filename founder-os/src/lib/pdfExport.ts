import jsPDF from 'jspdf';
import { StartupIdea } from '../types';

export function exportIdeaPDF(idea: StartupIdea) {
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkNewPage = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Header Banner
  doc.setFillColor(15, 23, 42); // Dark slate
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('FOUNDEROS EXECUTIVE BRIEF', margin, 12);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()} | Cold Investor Rationality Report`, margin, 20);

  y = 38;

  // Title & Sentence
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(idea.title, margin, y);
  y += 8;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  const descLines = doc.splitTextToSize(idea.oneSentenceDescription, contentWidth);
  doc.text(descLines, margin, y);
  y += descLines.length * 6 + 4;

  // Verdict Box if analyzed
  if (idea.analysis) {
    checkNewPage(24);
    const score = idea.analysis.overallScore;
    const verdict = idea.analysis.shouldBuild;

    // Background box
    if (verdict === 'YES') doc.setFillColor(236, 253, 245);
    else if (verdict === 'NO') doc.setFillColor(254, 242, 242);
    else doc.setFillColor(255, 251, 235);

    doc.rect(margin, y, contentWidth, 20, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, y, contentWidth, 20, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    if (verdict === 'YES') doc.setTextColor(5, 150, 105);
    else if (verdict === 'NO') doc.setTextColor(220, 38, 38);
    else doc.setTextColor(217, 119, 6);

    doc.text(`RECOMMENDATION: ${verdict}  (Overall Score: ${score}/100)`, margin + 6, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const ratLines = doc.splitTextToSize(`Rationale: ${idea.analysis.verdictRationale}`, contentWidth - 12);
    doc.text(ratLines[0] || '', margin + 6, y + 15);

    y += 26;
  }

  // Section Helper
  const addSectionHeader = (title: string) => {
    checkNewPage(12);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(title.toUpperCase(), margin + 4, y + 5.5);
    y += 12;
  };

  const addField = (label: string, text: string) => {
    if (!text) return;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);

    const labelStr = `${label}: `;
    const labelWidth = doc.getTextWidth(labelStr);

    checkNewPage(8);
    doc.text(labelStr, margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);

    const lines = doc.splitTextToSize(text, contentWidth - labelWidth);
    if (lines.length === 1) {
      doc.text(lines[0], margin + labelWidth, y);
      y += 6;
    } else {
      doc.text(lines[0], margin + labelWidth, y);
      y += 5;
      for (let i = 1; i < lines.length; i++) {
        checkNewPage(5);
        doc.text(lines[i], margin, y);
        y += 5;
      }
      y += 2;
    }
  };

  // 1. Core Idea
  addSectionHeader('1. Core Specifications');
  addField('Problem', idea.problem);
  addField('Target Users', idea.targetUsers);
  addField('Solution', idea.solution);
  addField('Why Now', idea.whyNow);
  addField('Market Size', idea.marketSize);
  addField('Competitors', idea.competitors);
  addField('Advantage', idea.competitiveAdvantage);
  addField('Business Model', idea.businessModel);
  addField('Monetization', idea.monetization);
  addField('MVP Scope', idea.mvp);
  addField('Risks', idea.risks);
  addField('Why Could Fail', idea.whyCouldFail);

  // 2. Scores & Analysis
  if (idea.analysis) {
    y += 4;
    addSectionHeader('2. AI Scorecard & Market Intelligence');

    const s = idea.analysis.scores;
    const scoresStr = `Market Need: ${s.marketNeed} | Originality: ${s.originality} | Competition: ${s.competition} | Execution: ${s.difficulty} | Monetization: ${s.monetization} | Scalability: ${s.scalability} | Founder Fit: ${s.founderFit} | Tech Complexity: ${s.technicalComplexity} | GTM: ${s.goToMarketDifficulty} | AI Value: ${s.aiValue}`;
    addField('Score Matrix', scoresStr);

    if (idea.analysis.strengths.length > 0) {
      addField('Strengths', idea.analysis.strengths.join('; '));
    }
    if (idea.analysis.weaknesses.length > 0) {
      addField('Weaknesses', idea.analysis.weaknesses.join('; '));
    }
    if (idea.analysis.hiddenRisks.length > 0) {
      addField('Hidden Risks', idea.analysis.hiddenRisks.join('; '));
    }
    addField('Biggest Mistake', idea.analysis.biggestMistake);
    addField('MVP Rec', idea.analysis.mvpRecommendation);
  }

  // 3. Critic Mode
  if (idea.criticMode) {
    y += 4;
    addSectionHeader('3. Investor Critic Mode');
    addField('OpenAI Threat', idea.criticMode.openaiThreat);
    addField('Status Quo Threat', idea.criticMode.statusQuoThreat);
    addField('First 100 Users', idea.criticMode.first100UsersChallenge);
    addField('Monetization Hurdle', idea.criticMode.monetizationHurdle);
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`FounderOS © Confidential Executive Brief | Page ${i} of ${pageCount}`, margin, pageHeight - 8);
  }

  doc.save(`${idea.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-founderos.pdf`);
}
