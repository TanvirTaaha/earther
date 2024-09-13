defmodule NasaSpaceAppsWeb.EarthLive do
  use NasaSpaceAppsWeb, :live_view

  def render(assigns) do
    ~H"""
    <div id="EarthScene-hook" phx-hook="EarthScene" phx-update="ignore">
      <div id="floatingDiv">Hello from the box!</div>
      <canvas id="earthScene" />
    </div>
    """
  end
end
