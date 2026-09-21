require("next/babel"); // to enable jsx parsing if needed, but we don't have it. Let's just catch syntax errors.
import("./app/(dashboard)/(reseau-commercial)/provider/read/[uuid]/page.jsx").catch(e => console.log(e))
