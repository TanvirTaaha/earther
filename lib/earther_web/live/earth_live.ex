defmodule EartherWeb.EarthLive do
  use EartherWeb, :live_view

  def mount(_params, _session, socket) do
    socket =
      assign(socket,
        page_title: "Welcome",
        json_data: Jason.encode!(get_coordinates()),
        continents: get_coordinates()
      )

    {:ok, socket}
  end

  def render(assigns) do
    ~H"""
    <div id="EarthSceneHook" phx-hook="EarthScene" phx-update="ignore" data-continents={@json_data}>
      <%= for continent <- @continents do %>
        <div id={"floatingDiv-#{continent.continent}"} class="floatingDiv">
          <%= "Hello from #{continent.continent}!" %>
        </div>
      <% end %>
      <canvas id="earthScene" />
    </div>
    """
  end

  defp get_coordinates() do
    [
      %{continent: "Africa", lat: 9.1021, lon: 21.4531},
      %{continent: "Asia", lat: 34.0479, lon: 100.6197},
      %{continent: "Europe", lat: 54.5260, lon: 15.2551},
      %{continent: "North America", lat: 54.5260, lon: -105.2551},
      %{continent: "South America", lat: -14.2350, lon: -51.9253},
      %{continent: "Australia", lat: -25.2744, lon: 133.7751},
      %{continent: "Antarctica", lat: -82.8628, lon: 135.0000}
      # %{ continent: "Dhaka", lat: 23.8041, lon: 90.4152 },
      # %{ continent: "Prime Meridian", lat: 0, lon: 0 },
    ]
  end
end
