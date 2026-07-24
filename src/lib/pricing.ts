export interface PricingResult {
  totalCustomerPrice: number;
  totalOwnerCost: number;
  estimatedProfit: number;
  totalDrivingDistanceKm: number;
  distanceText: string;
  durationText: string;
  kalkulationHtml: string;
}

export async function calculateMovePrice(from: string, to: string, googleMapsApiKey: string): Promise<PricingResult | null> {
  try {
    const COMPANY_HQ = "Zehnthofstraße 55, 55252 Mainz-Kastel, Deutschland";

    // Distanz: HQ -> Auszugsort (From)
    const mapsUrlHqToFrom = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(COMPANY_HQ)}&destinations=${encodeURIComponent(from)}&key=${googleMapsApiKey}`;
    // Distanz: Auszugsort (From) -> Einzugsort (To)
    const mapsUrlFromToTo = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(from)}&destinations=${encodeURIComponent(to)}&key=${googleMapsApiKey}`;

    const [res1, res2] = await Promise.all([
      fetch(mapsUrlHqToFrom).then(res => res.json()),
      fetch(mapsUrlFromToTo).then(res => res.json())
    ]);

    let hqToFromKm = 0;
    let fromToToKm = 0;
    let distanceText = "Nicht angegeben";
    let durationText = "";

    if (res1.rows?.[0]?.elements?.[0]?.status === "OK") {
      hqToFromKm = res1.rows[0].elements[0].distance.value / 1000;
    }

    if (res2.rows?.[0]?.elements?.[0]?.status === "OK") {
      const element = res2.rows[0].elements[0];
      fromToToKm = element.distance.value / 1000;
      distanceText = element.distance.text;
      durationText = element.duration.text;
    }

    if (fromToToKm > 0) {
      const totalDrivingDistanceKm = hqToFromKm + fromToToKm;

      // --- NEUE MARKT-FORMEL (Strikt 5 Euro/km ab HQ) ---
      const pricePerKmFahrzeug = 5.00;
      const costPerKmFahrzeug = 1.50; // Geschätzte interne Kosten für Sprit/Abnutzung
      
      // Pauschale für Arbeiter (Wird später durch echte Stundensätze ersetzt)
      const baseLaborFee = 150; // Beispiel: 2 Arbeiter für ein paar Stunden

      const totalCustomerPrice = baseLaborFee + (totalDrivingDistanceKm * pricePerKmFahrzeug);
      const totalOwnerCost = (totalDrivingDistanceKm * costPerKmFahrzeug) + 80; // Interne Kosten (Fahrt + Arbeiterlohn)
      const estimatedProfit = totalCustomerPrice - totalOwnerCost;

      const kalkulationHtml = `
        <div style="background: #f0f7ff; padding: 20px; border-radius: 12px; border: 1px solid #0070f3; margin-top: 20px; font-family: sans-serif;">
          <h2 style="color: #0070f3; margin-top: 0; font-size: 18px; border-bottom: 2px solid #0070f3; padding-bottom: 10px;">📊 Finanzielle KI-Einschätzung</h2>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0;"><strong>🗺️ Distanz (inkl. Anfahrt):</strong> ${totalDrivingDistanceKm.toFixed(1)} km (${durationText})</p>
          </div>

          <div style="background: #ffffff; padding: 10px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #28a745;">
            <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase;">Angebot für den Kunden</p>
            <p style="margin: 5px 0; font-size: 20px; font-weight: bold; color: #28a745;">${totalCustomerPrice.toFixed(2)} €</p>
          </div>

          <div style="background: #ffffff; padding: 10px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #dc3545;">
            <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase;">Geschätzte Eigenkosten (Diesel/Zeit)</p>
            <p style="margin: 5px 0; font-size: 16px; font-weight: bold; color: #dc3545;">${totalOwnerCost.toFixed(2)} €</p>
          </div>

          <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #0070f3; font-size: 14px;">Voraussichtlicher Gewinn</p>
            <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: #0070f3;">+ ${estimatedProfit.toFixed(2)} €</p>
          </div>
          
          <p style="color: #777; font-size: 11px; margin-top: 15px; font-style: italic;">
            *Formel: ${totalDrivingDistanceKm.toFixed(1)} km x 5,00€/km = ${(totalDrivingDistanceKm * pricePerKmFahrzeug).toFixed(2)}€ (Fahrzeugkosten) + ${baseLaborFee}€ (Arbeitskraft-Pauschale).
          </p>
        </div>
      `;

      return {
        totalCustomerPrice,
        totalOwnerCost,
        estimatedProfit,
        totalDrivingDistanceKm,
        distanceText,
        durationText,
        kalkulationHtml
      };
    }

    return null;
  } catch (err) {
    console.error("Google Maps Error in pricing:", err);
    return null;
  }
}
