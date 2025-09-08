import { render, screen } from "@testing-library/react";
import TicketDetail from "../pages/TicketDetail.jsx";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import api from "../api";

vi.mock("../api", () => ({
  default: {
    get: vi.fn()
      .mockResolvedValueOnce({ data:{ _id:"1", title:"App 500", description:"err", status:"waiting_human", replies:[] }}) // /tickets/:id
      .mockResolvedValueOnce({ data:{ predictedCategory:"tech", confidence:0.9, draftReply:"...", articleIds:["a","b"] }}) // /agent/suggestion/:id
      .mockResolvedValueOnce({ data:[{ id:"a", title:"Fix Error 500", snippet:"..." }, { id:"b", title:"Login Issues", snippet:"..." }]}) // /kb/batch
      .mockResolvedValueOnce({ data:[] }) // /tickets/:id/audit
  }
}));

it("shows suggestion and similar articles", async () => {
  render(
    <MemoryRouter initialEntries={["/tickets/1"]}>
      <Routes><Route path="/tickets/:id" element={<TicketDetail/>} /></Routes>
    </MemoryRouter>
  );
  expect(await screen.findByText(/Agent Suggestion/i)).toBeTruthy();
  expect(await screen.findByText(/Fix Error 500/i)).toBeTruthy();
});
