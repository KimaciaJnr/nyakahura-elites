// Leadership & governance — public "about us" data.
//
// Any member can be elected to any role, and regimes run on a 3-year election
// cycle. The current regime was elected at the AGM of Dec 2025 and took office
// in January 2026. The founding regime led the group since its foundations.
//
// Real photos/contacts will be added later: drop images into /public/leadership/
// and set `photo` (e.g. "/leadership/marvin.jpg"); until then the section shows
// an initials avatar.

export const ELECTION_CYCLE_YEARS = 3;

export const CURRENT_REGIME = {
  label: "Current leadership",
  term: "January 2026 – December 2028",
  note: "Elected at the AGM of December 2025; took office in January 2026. Next elections: 2029.",
  roles: [
    { name: "Marvin Karanja", role: "Chairperson", photo: "" },
    { name: "Maureen Wanjiku", role: "Vice chairperson", photo: "" },
    { name: "Jane Wangari", role: "Treasurer", photo: "" },
    { name: "Susan Wambui", role: "Secretary", photo: "" },
    { name: "Simon Kamau", role: "Organizing secretary", photo: "" },
    { name: "Stanley Ndiba", role: "Nominated member", photo: "" },
  ],
};

export const FOUNDING_REGIME = {
  label: "Founding leadership",
  term: "Founding – December 2025",
  note: "The first committee; led the chama from its foundations through the 2025 handover.",
  roles: [
    { name: "John Thiong'o", role: "Chairperson", photo: "" },
    { name: "Vincent Ng'ang'a", role: "Secretary", photo: "" },
    { name: "Peter Maina", role: "Organizing secretary", photo: "" },
    { name: "David Muhia", role: "Treasurer", photo: "" },
    { name: "Esther Mucho", role: "Vice chairperson", photo: "" },
  ],
};