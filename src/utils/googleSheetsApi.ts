
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
        featuredImageURL: row[7] || ''
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
    
    // For now, we'll use a simple approach by calling a public endpoint
    // Note: This requires setting up a Google Apps Script web app
    // Alternative: Use Google Forms or manual entry
    
    console.log('Comment to be added:', rowData);
    console.log('Add this row to your Comments sheet manually or set up Google Apps Script');
    
    // Since we can't directly write to Google Sheets from the frontend without CORS issues,
    // we'll simulate the addition for now and log the data
    // In a real implementation, you'd need either:
    // 1. A backend service
    // 2. Google Apps Script web app
    // 3. Google Forms submission
    
    return true;
  } catch (error) {
    console.error('Error adding comment:', error);
    return false;
  }
};

export const fetchGoogleDocContent = async (docUrl: string): Promise<string> => {
  try {
    if (!docUrl || !docUrl.includes('docs.google.com')) {
      return '<p>No valid Google Doc URL provided for this post.</p>';
    }
    
    // Convert Google Docs URL to published format if needed
    let publishedUrl = docUrl;
    if (docUrl.includes('/edit')) {
      publishedUrl = docUrl.replace('/edit#gid=', '/export?format=html&gid=');
      publishedUrl = publishedUrl.replace('/edit', '/export?format=html');
    }
    
    const response = await fetch(publishedUrl);
    const htmlContent = await response.text();
    
    // Extract content from the Google Doc HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Remove Google Docs specific elements
    const scripts = doc.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    const styles = doc.querySelectorAll('style');
    styles.forEach(style => style.remove());
    
    // Get the main content
    const bodyContent = doc.querySelector('#contents') || doc.body;
    if (bodyContent) {
      return bodyContent.innerHTML;
    }
    
    return '<p>Content could not be loaded from the Google Doc. Please check that the document is published to the web.</p>';
  } catch (error) {
    console.error('Error fetching Google Doc content:', error);
    return '<p>Error loading content from Google Doc. Please check the document URL and ensure it\'s published to the web.</p>';
  }
};
