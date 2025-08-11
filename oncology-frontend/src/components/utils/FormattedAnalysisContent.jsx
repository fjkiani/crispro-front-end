import React from 'react';
import PropTypes from 'prop-types';

// --- Helper Component to Format AI Analysis Text ---
const FormattedAnalysisContent = ({ text }) => {
  if (!text || typeof text !== 'string') {
    return <p className="text-xs text-gray-700 whitespace-pre-wrap italic">No content available.</p>; // Adjusted class
  }

  const lines = text.split('\n');
  const formattedElements = [];
  let inList = false;
  let listType = null; // 'disc' or 'decimal'

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Regex to find **bolded text**
    const boldPattern = /\*\*(.*?)\*\*/g;
    const renderLineWithBold = (inputLine) => {
      const parts = [];
      let lastIndex = 0;
      let match;
      while ((match = boldPattern.exec(inputLine)) !== null) {
        if (match.index > lastIndex) {
          parts.push(inputLine.substring(lastIndex, match.index));
        }
        parts.push(<strong key={`bold-${index}-${lastIndex}`}>{match[1]}</strong>);
        lastIndex = boldPattern.lastIndex;
      }
      if (lastIndex < inputLine.length) {
        parts.push(inputLine.substring(lastIndex));
      }
      // Wrap the parts in a React Fragment to ensure a single return element if needed, though often not necessary here
      return <>{parts}</>; 
    };
    
    // --- Close previous list if type changes or non-list item encountered ---
    const closeListIfNeeded = (currentLineType) => {
      if (inList && currentLineType !== listType) {
        const listItems = formattedElements.pop();
        const ListTag = listType === 'decimal' ? 'ol' : 'ul';
        const listClass = listType === 'decimal' 
          ? "list-decimal list-inside pl-5 my-1 text-xs text-gray-700" 
          : "list-disc list-inside pl-5 my-1 text-xs text-gray-700";
        if (Array.isArray(listItems) && listItems.length > 0) { // Only add list if it has items
             formattedElements.push(<ListTag key={`list-end-${index - 1}`} className={listClass}>{listItems}</ListTag>);
        }
        inList = false;
        listType = null;
      }
    };

    // --- Logic for different line types ---

    if (trimmedLine.startsWith('**') && trimmedLine.endsWith(':**')) { // Main Title: **Title:**
      closeListIfNeeded(null); // Close any open list
      formattedElements.push(
        <h4 key={`h4-${index}`} className="text-sm font-semibold text-gray-700 mt-3 mb-1.5">
          {renderLineWithBold(trimmedLine.substring(2, trimmedLine.length - 3))} {/* Changed text color/margin */}
        </h4>
      );
    } else if (trimmedLine.match(/^\*\*\d+\.\s.*?(:\*\*)?$/) || trimmedLine.match(/^\d+\.\s.*?(:\*\*)?$/)) { // Numbered Section: **1. Section:** or 1. Section:** or **1. Section** etc.
      closeListIfNeeded(null); // Close any open list
      let headingText = trimmedLine.replace(/^\*\*\d+\.\s*/, '').replace(/^\d+\.\s*/, '');
      if(headingText.endsWith(':**')) headingText = headingText.slice(0, -3);
      if(headingText.startsWith('**')) headingText = headingText.slice(2);
      if(headingText.endsWith('**')) headingText = headingText.slice(0, -2); // Handle cases like **Title**
       if (headingText.endsWith(':')) headingText = headingText.slice(0, -1); // Remove trailing colon if present

      formattedElements.push(
        <h5 key={`h5-${index}`} className="text-xs font-semibold text-gray-600 mt-2 mb-1 pl-1"> {/* Changed text color/margin */}
          {renderLineWithBold(headingText.trim())}
        </h5>
      );
    } else if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) { // Bullet Point (disc)
      const currentLineListType = 'disc';
      closeListIfNeeded(currentLineListType); // Close if changing from decimal
      if (!inList) {
        inList = true;
        listType = currentLineListType;
        formattedElements.push([]); // Start a new list array
      }
      const currentList = formattedElements[formattedElements.length - 1];
       if (Array.isArray(currentList)) { // Ensure it's an array before pushing
           currentList.push(
             <li key={`li-${index}`} className="ml-2 leading-relaxed"> {/* Added leading-relaxed */}
               {renderLineWithBold(trimmedLine.substring(2))}
             </li>
           );
       } else {
            console.warn("FormattedAnalysisContent: Expected array for list items, found:", currentList);
            // Handle error? Maybe start a new list?
            formattedElements.push([<li key={`li-err-${index}`} className="ml-2 leading-relaxed">{renderLineWithBold(trimmedLine.substring(2))}</li>]);
       }
    } else if (trimmedLine.match(/^\d+\)\s/) || trimmedLine.match(/^\d+\.\s/)) { // Numbered list item 1) or 1.
        const currentLineListType = 'decimal';
        closeListIfNeeded(currentLineListType); // Close if changing from disc
         if (!inList) {
           inList = true;
           listType = currentLineListType;
           formattedElements.push([]); // Start a new list array
         }
        const currentList = formattedElements[formattedElements.length - 1];
        const itemText = trimmedLine.replace(/^\d+[\.\)]\s/, ''); // Remove numbering
        if (Array.isArray(currentList)) {
            currentList.push(
              <li key={`li-${index}`} className="ml-2 leading-relaxed"> {/* Added leading-relaxed */}
                {renderLineWithBold(itemText)}
              </li>
            );
        } else {
             console.warn("FormattedAnalysisContent: Expected array for list items, found:", currentList);
             formattedElements.push([<li key={`li-err-${index}`} className="ml-2 leading-relaxed">{renderLineWithBold(itemText)}</li>]);
        }
    } else { // Regular Paragraph
      closeListIfNeeded(null); // Close any open list
      if (trimmedLine) {
        formattedElements.push(
          <p key={`p-${index}`} className="text-xs text-gray-800 whitespace-pre-wrap my-1.5 pl-1 leading-relaxed indent-2"> {/* Adjusted styling: gray-800, my-1.5, indent-2 */}
            {renderLineWithBold(trimmedLine)}
          </p>
        );
      }
    }
  });

  // --- Close any trailing list ---
  if (inList) { 
    const listItems = formattedElements.pop();
    const ListTag = listType === 'decimal' ? 'ol' : 'ul';
    const listClass = listType === 'decimal' 
      ? "list-decimal list-inside pl-5 my-1 text-xs text-gray-700" 
      : "list-disc list-inside pl-5 my-1 text-xs text-gray-700";
     if (Array.isArray(listItems) && listItems.length > 0) {
         formattedElements.push(<ListTag key="list-final" className={listClass}>{listItems}</ListTag>);
     }
  }
  
  // Filter out empty arrays that might have been pushed for lists that didn't get items
  return <>{formattedElements.filter(el => !(Array.isArray(el) && el.length === 0))}</>;
};

FormattedAnalysisContent.propTypes = {
  text: PropTypes.string,
};
// --- End Helper Component ---

export default FormattedAnalysisContent; 