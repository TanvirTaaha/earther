defmodule NasaSpaceAppsWeb.EarthLive do
  use NasaSpaceAppsWeb, :live_view

  def render(assigns) do
    ~H"""
    <div id="my-hook" phx-hook="EarthScene" phx-update="ignore"></div>
    """
  end
end
