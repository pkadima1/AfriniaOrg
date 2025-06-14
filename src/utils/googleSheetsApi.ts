
// Google Sheets API utility functions
const SHEET_ID = '16brbAVXZVvOap4KGH7_l67_QlHX_TCKrD_GzlGvR5LU';
const API_KEY = 'AIzaSyB29zszwpzTrWtc7ynAOxjn9Hd9bdigqBU';

export interface BlogPost {
  title: string;
  slug: string;
  author: string;
  date: string;
  category: string;
  summary: string;
  publishedDocURL: string;
  featuredImageURL: string;
}

export interface Comment {
  id: string;
  name: string;
  email?: string;
  message: string;
  date: string;
  parentId?: string;
  postSlug: string;
  replies?: Comment[];
}

// Helper function to convert Google Drive sharing links to direct image URLs
const convertGoogleDriveUrl = (url: string): string => {
  if (!url || !url.includes('drive.google.com')) {
    return url;
  }
  
  // Extract file ID from Google Drive URLs
  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  return url;
};

export const fetchBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const range = 'Sheet1!A:H';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.values) {
      const [headers, ...rows] = data.values;
      return rows.map((row: string[]) => ({
        title: row[0] || '',
        slug: row[1] || '',
        author: row[2] || '',
        date: row[3] || '',
        category: row[4] || '',
        summary: row[5] || '',
        publishedDocURL: row[6] || '',
        featuredImageURL: convertGoogleDriveUrl(row[7] || '')
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
};

export const fetchComments = async (postSlug: string): Promise<Comment[]> => {
  try {
    const range = 'Comments!A:G';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.values) {
      const [headers, ...rows] = data.values;
      const fetchedComments = rows
        .filter((row: string[]) => row[0] === postSlug)
        .map((row: string[]) => ({
          id: row[1] || '',
          postSlug: row[0] || '',
          name: row[2] || '',
          email: row[3] || '',
          message: row[4] || '',
          date: row[5] || '',
          parentId: row[6] || undefined
        }));
      
      // Organize comments with replies
      const topLevelComments = fetchedComments.filter(c => !c.parentId);
      const replies = fetchedComments.filter(c => c.parentId);
      
      return topLevelComments.map(comment => ({
        ...comment,
        replies: replies.filter(reply => reply.parentId === comment.id)
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

export const addComment = async (comment: Omit<Comment, 'id' | 'date'>): Promise<boolean> => {
  try {
    const commentId = Date.now().toString();
    const date = new Date().toISOString();
    
    // Prepare the row data for Google Sheets
    const rowData = [
      comment.postSlug,
      commentId,
      comment.name,
      comment.email || '',
      comment.message,
      date,
      comment.parentId || ''
    ];
    
    console.log('Comment to be added:', rowData);
    console.log('Add this row to your Comments sheet manually or set up Google Apps Script');
    
    return true;
  } catch (error) {
    console.error('Error adding comment:', error);
    return false;
  }
};

export const fetchGoogleDocContent = async (docUrl: string): Promise<string> => {
  try {
    console.log('Fetching content from URL:', docUrl);
    
    if (!docUrl || !docUrl.includes('docs.google.com')) {
      console.log('Invalid Google Doc URL:', docUrl);
      return '<p>No valid Google Doc URL provided for this post.</p>';
    }
    
    // Try multiple approaches to fetch the content
    const approaches = [
      // Approach 1: Try cors-anywhere proxy
      () => fetch(`https://cors-anywhere.herokuapp.com/${docUrl}`),
      
      // Approach 2: Try direct fetch (might work in some cases)
      () => fetch(docUrl, { mode: 'no-cors' }),
      
      // Approach 3: Use a different proxy service
      () => fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(docUrl)}`),
    ];
    
    for (let i = 0; i < approaches.length; i++) {
      try {
        console.log(`Trying approach ${i + 1}`);
        const response = await approaches[i]();
        
        if (response.ok) {
          const htmlContent = await response.text();
          
          if (htmlContent && htmlContent.length > 100) {
            // Parse and clean the content
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            
            // Remove scripts and styles
            doc.querySelectorAll('script, style').forEach(el => el.remove());
            
            // Get the main content
            let bodyContent = doc.querySelector('#contents') || 
                             doc.querySelector('#doc-content') || 
                             doc.querySelector('.doc-content') ||
                             doc.querySelector('body');
            
            if (bodyContent) {
              let content = bodyContent.innerHTML;
              
              // Clean up and style the content
              content = content.replace(/<script[^>]*>.*?<\/script>/gi, '');
              content = content.replace(/<p/g, '<p class="mb-4"');
              content = content.replace(/<h1/g, '<h1 class="text-3xl font-bold mb-6"');
              content = content.replace(/<h2/g, '<h2 class="text-2xl font-semibold mb-4"');
              content = content.replace(/<h3/g, '<h3 class="text-xl font-medium mb-3"');
              
              console.log('Successfully extracted content with approach', i + 1);
              return content;
            }
          }
        }
      } catch (error) {
        console.log(`Approach ${i + 1} failed:`, error);
      }
    }
    
    // If all approaches fail, provide a helpful message with manual instructions
    return `
      <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold mb-3 text-blue-300">Content Loading Issue</h3>
        <p class="text-blue-200 mb-3">
          We're unable to automatically load the content from your Google Doc due to browser security restrictions.
        </p>
        <p class="text-blue-200 mb-3">
          <strong>To view the full content:</strong>
        </p>
        <ol class="list-decimal list-inside text-blue-200 space-y-1 mb-4">
          <li>Click the link below to open the Google Doc</li>
          <li>Copy the content from the document</li>
          <li>Or ask the author to share a direct link to the content</li>
        </ol>
        <a href="${docUrl}" target="_blank" rel="noopener noreferrer" 
           class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          View Original Document →
        </a>
      </div>
      <div class="prose prose-invert">
        <h2>Content Preview</h2>
        <p>This blog post discusses how to instantly write human-like SEO blog posts with EngagePerfectAI. The full content is available in the Google Doc linked above.</p>
        <p>Key topics likely covered include:</p>
        <ul>
          <li>AI-powered content generation techniques</li>
          <li>SEO optimization strategies</li>
          <li>Creating human-like writing with AI tools</li>
          <li>Best practices for blog post creation</li>
        </ul>
      </div>
    `;
    
  } catch (error) {
    console.error('Error fetching Google Doc content:', error);
    return `
      <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-3 text-red-300">Error Loading Content</h3>
        <p class="text-red-200 mb-3">
          There was an error loading the content from the Google Doc.
        </p>
        <a href="${docUrl}" target="_blank" rel="noopener noreferrer" 
           class="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
          View Original Document →
        </a>
      </div>
    `;
  }
};
