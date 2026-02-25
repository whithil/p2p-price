# **App Name**: P2P Price Pulse

## Core Features:

- EAN Barcode Scanning: Utilizes the `html5-qrcode` library to provide immediate camera access for scanning EAN-13 barcodes, featuring an intuitive overlay for accurate targeting.
- Decentralized Product & Price Data: Connects to a peer-to-peer network via `Gun.js` (using public relays like `https://gun-manhattan.herokuapp.com`) to retrieve and synchronize product names, brands, and price sets associated with EANs. Stores data in a graph structure where each EAN is a node.
- simple Consensus Price Algorithm without AI: Implements a robust data analysis tool using the Median Absolute Deviation (MAD) and Gaussian Weighting algorithm to identify and significantly reduce the influence of outlier prices, thus calculating a reliable and troll-resistant consensus price for display.
- Product Information Display: Dynamically renders a 'Product Card' showing the scanned product's name, brand, the calculated consensus price, and the count of unique contributors to its pricing data.
- Product Creation & Price Submission: Presents a simple form for users to register new products (name and price) if an EAN is not found, or to submit updated price observations for existing products. Each submission includes an anonymous `device_id` and timestamp.
- P2P Network Status Indicator: Provides real-time visual feedback (e.g., Online/Offline) on the connection and synchronization status of the `Gun.js` peer-to-peer network.

## Style Guidelines:

- Primary color: A sophisticated deep blue (#3366CC) selected to evoke trustworthiness and technological expertise. This shade anchors the interface's overall aesthetic.
- Background color: A very dark, almost black hue with a subtle blue tint (#15171A), chosen to create a modern dark mode experience that provides ideal depth for Glassmorphism effects.
- Accent color: A vibrant yet clean cyan-blue (#60CCE6), strategically used to highlight interactive elements, calls to action, and network status indicators, offering striking contrast against the dark background.
- Body and headline font: 'Inter' (sans-serif) is chosen for its contemporary, highly legible, and objective aesthetic, which is particularly well-suited for the clear display of critical price and product information across all devices.
- Modern, crisp line-art style icons will be utilized for common actions such as scanning, adding new data, and displaying network status, ensuring immediate recognizability and clarity.
- The application will strictly follow a mobile-first responsive design paradigm, ensuring a consistent and fluid user experience across diverse screen sizes. Emphasis will be placed on generous spacing, a clear informational hierarchy, and easily tappable touch targets, especially on critical interaction screens like scanning and data entry forms.
- Subtle, functional animations will be incorporated to provide unobtrusive feedback during asynchronous operations like data synchronization, price updates, and navigational transitions, thereby enhancing the perception of responsiveness without causing distractions.