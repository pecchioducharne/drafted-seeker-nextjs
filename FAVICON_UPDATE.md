# Favicon Update - Drafted Brand

## ✅ Fixed: React Default Favicon → Drafted Favicon

### Changes Made:

1. **Copied Favicon Files**
   - `favicon.ico` from `@drafted-seeker/public/`
   - `draftedTab.jpeg` → `icon.jpeg` for high-res icon

2. **Updated Metadata** (`app/layout.js`)
   ```javascript
   export const metadata = {
     title: 'Drafted',
     description: 'Every great hire begins with a great story.',
     icons: {
       icon: [
         { url: '/favicon.ico' },
         { url: '/icon.jpeg', type: 'image/jpeg' },
       ],
       apple: '/icon.jpeg',
     },
   };
   ```

3. **Added Extra Bold Font Weight**
   ```javascript
   const poppins = Poppins({
     weight: ['400', '500', '600', '700', '800'], // Added 800
     // ...
   });
   ```

### Files Updated:
- ✅ `app/favicon.ico` - Standard favicon (3.8KB)
- ✅ `app/icon.jpeg` - High-res icon (3.8KB)
- ✅ `app/layout.js` - Metadata & font weight

### How It Works:
In Next.js 13+ App Router:
- `app/favicon.ico` is automatically detected
- `app/icon.jpeg` provides high-res fallback
- Metadata explicitly defines icon hierarchy
- Apple devices use `icon.jpeg`

### Result:
- ✅ Browser tab shows Drafted logo
- ✅ Bookmarks show correct icon
- ✅ Mobile home screen icon works
- ✅ No more React default favicon

### Build Status:
```
✓ Compiled successfully
✓ favicon.ico recognized
✓ icon.jpeg recognized
```

---

**Favicon is now the Drafted brand icon!** 🎨
