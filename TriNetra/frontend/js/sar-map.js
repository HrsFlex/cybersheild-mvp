export async function initSarMap() {
    // Check if map container already exists in the DOM
    let mapContainer = document.getElementById('sar-map');
    
    if (!mapContainer) {
        // Find the map container that should already exist in the HTML
        mapContainer = document.querySelector('#sar-map');
        
        if (!mapContainer) {
            console.error('Map container #sar-map not found in DOM');
            return;
        }
    }
    
    // Clear any existing map content
    mapContainer.innerHTML = '';
    
    // Set styles for the existing container
    mapContainer.style.width = '100%';
    mapContainer.style.height = '400px';
    mapContainer.style.border = '2px solid #00ff87';
    mapContainer.style.borderRadius = '8px';
    mapContainer.style.boxShadow = '0 4px 20px rgba(0, 255, 135, 0.2)';

    const sarMap = L.map('sar-map', { minZoom: 3, maxZoom: 10 }).setView([20.5937, 78.9629], 5);

    const bounds = [[5, 66], [37, 99]];
    sarMap.setMaxBounds(bounds);
    sarMap.on('drag', () => sarMap.panInsideBounds(bounds, { animate: false }));

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CARTO',
    }).addTo(sarMap);

    // Legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = () => {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.backgroundColor = 'white';
        div.style.padding = '10px';
        div.style.borderRadius = '5px';
        div.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
        div.innerHTML = `
            <b>Legend</b><br>
            <span style="color:green;">🟢 From</span><br>
            <span style="color:red;">🔴 To</span><br>
            <span style="color:orange;">— Transaction Line</span>
        `;
        return div;
    };
    legend.addTo(sarMap);

    try {
        const response = await fetch('/api/autosar/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pattern: { scenario: 'terrorist_financing' } })
        });
        const data = await response.json();

        if (data.status === 'success' && data.transactions) {
            const markers = [];
            const lines = [];

            data.transactions.forEach(tx => {
                const from = tx.from_location;
                const to = tx.to_location;

                if (from && to) {
                    const fromIcon = L.divIcon({
                        className: '',
                        html: '<span style="font-size:18px;color:green;">🟢</span>',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    });
                    const toIcon = L.divIcon({
                        className: '',
                        html: '<span style="font-size:18px;color:red;">🔴</span>',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    });

                    const fromMarker = L.marker([from.lat, from.lon], { icon: fromIcon }).addTo(sarMap);
                    const toMarker = L.marker([to.lat, to.lon], { icon: toIcon }).addTo(sarMap);

                    const line = L.polyline([[from.lat, from.lon], [to.lat, to.lon]], {
                        color: 'orange',
                        weight: 2,
                        opacity: 0.5,
                        dashArray: '5,5'
                    }).addTo(sarMap);

                    markers.push(fromMarker, toMarker);
                    lines.push(line);

                    const popupContent = (hoverFrom = true) => `
                        <b>Transaction ID:</b> ${tx.transaction_id || 'N/A'}<br>
                        <b>From:</b> ${tx.from_account} (${from.city})<br>
                        <b>To:</b> ${tx.to_account} (${to.city})<br>
                        <b>Amount:</b> ₹${Number(tx.amount).toFixed(2)}<br>
                        <b>Suspicious Score:</b> ${tx.suspicious_score}
                    `;

                    const highlightTransaction = () => {
                        markers.forEach(m => m.setOpacity(0.2));
                        lines.forEach(l => l.setStyle({ opacity: 0.1, weight: 1 }));

                        fromMarker.setOpacity(1);
                        toMarker.setOpacity(1);
                        line.setStyle({ opacity: 0.9, weight: 3 });
                    };

                    const resetHighlight = () => {
                        markers.forEach(m => m.setOpacity(1));
                        lines.forEach(l => l.setStyle({ opacity: 0.5, weight: 2 }));
                    };

                    // Hover events for from marker
                    fromMarker.on('mouseover', () => {
                        highlightTransaction();
                        fromMarker.bindPopup(popupContent(true)).openPopup();
                    });
                    fromMarker.on('mouseout', () => {
                        resetHighlight();
                        fromMarker.closePopup();
                    });

                    // Hover events for to marker
                    toMarker.on('mouseover', () => {
                        highlightTransaction();
                        toMarker.bindPopup(popupContent(false)).openPopup();
                    });
                    toMarker.on('mouseout', () => {
                        resetHighlight();
                        toMarker.closePopup();
                    });
                }
            });
        }
    } catch (err) {
        console.error("Failed to fetch transactions:", err);
    }
}
