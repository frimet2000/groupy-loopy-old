import { useEffect } from 'react';

export const SEO = ({ title, description }) => {
  useEffect(() => {
    if (title) {
      document.title = `${title} | Groupy Loopy`;
      
      // Update og:title
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
         ogTitle = document.createElement('meta');
         ogTitle.setAttribute('property', 'og:title');
         document.head.appendChild(ogTitle);
      }
      ogTitle.content = title;
      
      // Update twitter:title
      let twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (!twitterTitle) {
         twitterTitle = document.createElement('meta');
         twitterTitle.setAttribute('name', 'twitter:title');
         document.head.appendChild(twitterTitle);
      }
      twitterTitle.content = title;
    }
    
    if (description) {
      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = "description";
        document.head.appendChild(metaDescription);
      }
      metaDescription.content = description;
      
      // Update og:description
      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (!ogDescription) {
         ogDescription = document.createElement('meta');
         ogDescription.setAttribute('property', 'og:description');
         document.head.appendChild(ogDescription);
      }
      ogDescription.content = description;
      
      // Update twitter:description
      let twitterDescription = document.querySelector('meta[name="twitter:description"]');
      if (!twitterDescription) {
         twitterDescription = document.createElement('meta');
         twitterDescription.setAttribute('name', 'twitter:description');
         document.head.appendChild(twitterDescription);
      }
      twitterDescription.content = description;
    }
  }, [title, description]);

  return null;
};
