defmodule NasaSpaceApps.Repo do
  use Ecto.Repo,
    otp_app: :nasa_space_apps,
    adapter: Ecto.Adapters.SQLite3
end
