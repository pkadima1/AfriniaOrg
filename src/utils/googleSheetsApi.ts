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
    
    // The URL from your sheet appears to already be in published format
    let publishedUrl = docUrl;
    
    // If it's an edit URL, convert it to published format
    if (docUrl.includes('/edit')) {
      const docId = docUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (docId) {
        publishedUrl = `https://docs.google.com/document/d/e/${docId}/pub`;
      }
    }
    
    console.log('Using published URL:', publishedUrl);
    
    // Use a proxy or CORS-enabled approach
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(publishedUrl)}`;
    
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    if (!data.contents) {
      console.log('No content received from proxy');
      return '<p>Content could not be loaded from the Google Doc. Please check that the document is published to the web.</p>';
    }
    
    const htmlContent = data.contents;
    
    // Extract content from the Google Doc HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Remove Google Docs specific elements
    const scripts = doc.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    const styles = doc.querySelectorAll('style');
    styles.forEach(style => style.remove());
    
    // Get the main content - try different selectors
    let bodyContent = doc.querySelector('#contents') || 
                     doc.querySelector('#doc-content') || 
                     doc.querySelector('.doc-content') ||
                     doc.querySelector('body');
    
    if (bodyContent) {
      // Clean up the content
      let content = bodyContent.innerHTML;
      
      // Remove any remaining script tags
      content = content.replace(/<script[^>]*>.*?<\/script>/gi, '');
      
      // Basic styling for better appearance
      content = content.replace(/<p/g, '<p class="mb-4"');
      content = content.replace(/<h1/g, '<h1 class="text-3xl font-bold mb-6"');
      content = content.replace(/<h2/g, '<h2 class="text-2xl font-semibold mb-4"');
      content = content.replace(/<h3/g, '<h3 class="text-xl font-medium mb-3"');
      
      console.log('Successfully extracted content');
      return content;
    }
    
    console.log('Could not find content in document structure');
    return '<p>Content could not be extracted from the Google Doc. Please check the document format.</p>';
  } catch (error) {
    console.error('Error fetching Google Doc content:', error);
    return '<p>Error loading content from Google Doc. Please check the document URL and ensure it\'s published to the web.</p>';
  }
};
